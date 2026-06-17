// =========================================================================
// CONFIGURACIÓN DE SUPABASE - REEMPLAZA CON TUS CREDENCIALES REALES
// =========================================================================
const SUPABASE_URL = "https://wxesqplgztzxayfxjyvg.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_qS9VyJvRyVpZdtzmFHypwQ_pY1ZCwDA";

// Inicialización del cliente global de Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Elementos del DOM guardados en variables para optimizar accesos
const authSection = document.getElementById('auth-section');
const dashboardSection = document.getElementById('dashboard-section');
const userDisplay = document.getElementById('user-display');
const authMessage = document.getElementById('auth-message');
const clientMessage = document.getElementById('client-message');
const clientesTableBody = document.getElementById('clientes-table-body');

// Variables para formularios de autenticación
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');


// =========================================================================
// LÓGICA DE INTERFAZ (CONTROL DE PESTAÑAS Y VISTAS)
// =========================================================================

// Alternar entre las pestañas de Iniciar Sesión y Crear Usuario
function switchAuthTab(tab) {
    authMessage.textContent = ""; // Limpiar mensajes previos
    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        tabLogin.classList.remove('active');
        tabRegister.classList.add('active');
    }
}

// Controlar la visibilidad del Panel de Control según el estado de sesión
function checkSession() {
    // Intentamos recuperar una sesión simulada en el almacenamiento del navegador
    const sessionUser = localStorage.getItem('tecnoinnova_user');
    if (sessionUser) {
        userDisplay.textContent = sessionUser;
        authSection.classList.add('hidden');
        dashboardSection.classList.remove('hidden');
        fetchClientes(); // Carga automática de los datos desde Supabase
    } else {
        authSection.classList.remove('hidden');
        dashboardSection.classList.add('hidden');
    }
}


// =========================================================================
// FUNCIONALIDAD 1: REGISTRO Y LOGIN DE USUARIOS
// =========================================================================

// Evento para Registrar un Usuario nuevo
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    authMessage.textContent = "Procesando...";
    authMessage.className = "message";

    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value;

    if (password.length < 6) {
        showFeedback(authMessage, 'La contraseña debe tener al menos 6 caracteres.', 'error');
        return;
    }

    // Insertar el nuevo usuario en la tabla 'usuarios' que creamos en tu Script de PostgreSQL
    const { data, error } = await supabase
        .from('usuarios')
        .insert([{ username: username, password_hash: password }]); // Nota: Para fines académicos guardamos la clave, en producción debe encriptarse.

    if (error) {
        console.error(error);
        if (error.code === '23505') { // Código SQL para violación de clave única (Username duplicado)
            showFeedback(authMessage, 'El nombre de usuario ya está registrado.', 'error');
        } else {
            showFeedback(authMessage, `Error al registrar: ${error.message}`, 'error');
        }
    } else {
        showFeedback(authMessage, '¡Usuario creado con éxito! Ya puedes iniciar sesión.', 'success');
        registerForm.reset();
        setTimeout(() => switchAuthTab('login'), 1500);
    }
});

// Evento para Iniciar Sesión (Login)
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    authMessage.textContent = "Verificando...";
    authMessage.className = "message";

    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    // Buscar el usuario en la tabla de la base de datos
    const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('username', username)
        .single(); // Traer solo un registro coincidente

    if (error || !data) {
        showFeedback(authMessage, 'Usuario no encontrado o error de red.', 'error');
        return;
    }

    // Validar contraseña (Simulada contra el hash/texto plano de la DB)
    if (data.password_hash === password) {
        localStorage.setItem('tecnoinnova_user', data.username); // Guardar estado de sesión local
        showFeedback(authMessage, '¡Acceso concedido!', 'success');
        
        setTimeout(() => {
            loginForm.reset();
            authMessage.textContent = "";
            checkSession();
        }, 1000);
    } else {
        showFeedback(authMessage, 'Contraseña incorrecta.', 'error');
    }
});

// Función para Cerrar Sesión
function logout() {
    localStorage.removeItem('tecnoinnova_user');
    checkSession();
}


// =========================================================================
// FUNCIONALIDAD 2: MOSTRAR DATOS DESDE SUPABASE (SELECT)
// =========================================================================

async function fetchClientes() {
    clientesTableBody.innerHTML = '<tr><td colspan="6" class="text-center">Actualizando datos...</td></tr>';

    // Hacer una consulta SELECT * FROM Clientes ordenados por su ID
    const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('id_cliente', { ascending: true });

    if (error) {
        clientesTableBody.innerHTML = `<tr><td colspan="6" class="text-center error">Error al cargar datos: ${error.message}</td></tr>`;
        return;
    }

    if (data.length === 0) {
        clientesTableBody.innerHTML = '<tr><td colspan="6" class="text-center">No hay clientes registrados en este momento.</td></tr>';
        return;
    }

    // Limpiar tabla e inyectar las filas dinámicamente con los datos recuperados
    clientesTableBody.innerHTML = '';
    data.forEach(cliente => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${cliente.id_cliente}</strong></td>
            <td>${cliente.nombre}</td>
            <td>${cliente.telefono || 'N/A'}</td>
            <td>${cliente.correo || 'N/A'}</td>
            <td><span class="badge">${cliente.historial_crediticio || 'Regular'}</span></td>
            <td>${cliente.id_zona || 'Sin Zona'}</td>
        `;
        clientesTableBody.appendChild(row);
    });
}


// =========================================================================
// FUNCIONALIDAD 3: INSERTAR DATOS DESDE FORMULARIO WEB (INSERT)
// =========================================================================

document.getElementById('client-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    clientMessage.textContent = "Guardando...";
    clientMessage.className = "message";

    // Recoger los datos estructurados del formulario de clientes
    const nuevoCliente = {
        id_cliente: document.getElementById('cli-id').value.trim().toUpperCase(),
        nombre: document.getElementById('cli-nombre').value.trim(),
        telefono: document.getElementById('cli-telefono').value.trim() || null,
        correo: document.getElementById('cli-correo').value.trim() || null,
        historial_crediticio: document.getElementById('cli-credito').value,
        id_zona: document.getElementById('cli-zona').value
    };

    // Ejecutar la inserción en la tabla 'clientes' de Supabase
    const { data, error } = await supabase
        .from('clientes')
        .insert([nuevoCliente]);

    if (error) {
        console.error(error);
        showFeedback(clientMessage, `Error SQL: ${error.message}`, 'error');
    } else {
        showFeedback(clientMessage, '¡Cliente registrado con éxito en Supabase!', 'success');
        document.getElementById('client-form').reset();
        fetchClientes(); // Volver a consultar la base de datos para ver el nuevo registro en la tabla
    }
});


// =========================================================================
// AYUDANTES (HELPERS)
// =========================================================================

function showFeedback(element, text, type) {
    element.textContent = text;
    element.className = `message ${type}`;
}

// Ejecutar al cargar la página por primera vez para comprobar si ya estaba logueado
document.addEventListener('DOMContentLoaded', checkSession);