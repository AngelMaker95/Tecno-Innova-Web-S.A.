// =========================================================================
// CONFIGURACIÓN DE SUPABASE - CREDENCIALES REALES
// =========================================================================
const SUPABASE_URL = "https://wxesqplgztzxayfxjyvg.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_qS9VyJvRyVpZdtzmFHypwQ_pY1ZCwDA";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Variables de Control de Estado
let currentTable = 'clientes'; // Tabla activa por defecto

// Elementos del DOM
const authSection = document.getElementById('auth-section');
const dashboardSection = document.getElementById('dashboard-section');
const userDisplay = document.getElementById('user-display');
const authMessage = document.getElementById('auth-message');
const clientMessage = document.getElementById('client-message');
const tableHead = document.getElementById('dynamic-table-head');
const tableBody = document.getElementById('clientes-table-body');

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');

// =========================================================================
// LÓGICA DE INTERFAZ Y PESTAÑAS
// =========================================================================

function switchAuthTab(tab) {
    authMessage.textContent = "";
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

function checkSession() {
    const sessionUser = localStorage.getItem('tecnoinnova_user');
    if (sessionUser) {
        userDisplay.textContent = sessionUser;
        authSection.classList.add('hidden');
        dashboardSection.classList.remove('hidden');
        loadTableData(); // Carga la tabla que esté activa
    } else {
        authSection.classList.remove('hidden');
        dashboardSection.classList.add('hidden');
    }
}

// Cambiar de vista entre Clientes, Productos, etc.
function changeTable(tableName) {
    currentTable = tableName;
    
    // Cambiar la clase activa en los botones superiores
    document.querySelectorAll('.btn-tab').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-tab-${tableName}`).classList.add('active');
    
    if(clientMessage) clientMessage.textContent = "";
    loadTableData();
}

function logout() {
    localStorage.removeItem('tecnoinnova_user');
    checkSession();
}

// =========================================================================
// RENDERIZADO DINÁMICO DE TABLAS (SELECT MULTI-TABLA)
// =========================================================================

async function loadTableData() {
    tableBody.innerHTML = '<tr><td colspan="10" class="text-center">Conectando a Supabase...</td></tr>';
    
    // 1. Configurar los encabezados según la tabla seleccionada
    let headHTML = '';
    let primaryKeyColumn = ''; // Guardamos el nombre de la columna ID para poder eliminar después

    if (currentTable === 'clientes') {
        primaryKeyColumn = 'id_cliente';
        headHTML = `<tr>
            <th>ID Cliente</th>
            <th>Nombre Completo</th>
            <th>Teléfono</th>
            <th>Correo Electrónico</th>
            <th>Crédito</th>
            <th>Zona</th>
            <th>Acciones</th>
        </tr>`;
    } else if (currentTable === 'productos') {
        primaryKeyColumn = 'id_producto';
        headHTML = `<tr>
            <th>ID Producto</th>
            <th>Descripción</th>
            <th>Stock Disp.</th>
            <th>Stock Mín.</th>
            <th>Precio Unitario</th>
            <th>Acciones</th>
        </tr>`;
    } else if (currentTable === 'pedidos') {
        primaryKeyColumn = 'id_pedido';
        headHTML = `<tr>
            <th>ID Pedido</th>
            <th>Fecha</th>
            <th>ID Cliente</th>
            <th>Val. Técnica</th>
            <th>Estado</th>
            <th>Acciones</th>
        </tr>`;
    } else if (currentTable === 'tecnicos') {
        primaryKeyColumn = 'id_tecnico';
        headHTML = `<tr>
            <th>ID Técnico</th>
            <th>Nombre Técnico</th>
            <th>Carga Activa</th>
            <th>Zona Asignada</th>
            <th>Acciones</th>
        </tr>`;
    }

    tableHead.innerHTML = headHTML;

    // 2. Hacer la consulta SELECT a Supabase de forma dinámica
    const { data, error } = await supabaseClient
        .from(currentTable)
        .select('*')
        .order(primaryKeyColumn, { ascending: true });

    if (error) {
        tableBody.innerHTML = `<tr><td colspan="10" class="text-center error">Error SQL: ${error.message}</td></tr>`;
        return;
    }

    if (data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="10" class="text-center">No hay registros en la tabla ${currentTable}.</td></tr>`;
        return;
    }

    // 3. Inyectar los datos en el cuerpo de la tabla
    tableBody.innerHTML = '';
    data.forEach(row => {
        const tr = document.createElement('tr');
        let rowsCells = '';

        if (currentTable === 'clientes') {
            rowsCells = `
                <td><strong>${row.id_cliente}</strong></td>
                <td>${row.nombre}</td>
                <td>${row.telefono || 'N/A'}</td>
                <td>${row.correo || 'N/A'}</td>
                <td><span class="badge">${row.historial_crediticio || 'Regular'}</span></td>
                <td>${row.id_zona || 'N/A'}</td>
            `;
            // Mandamos el ID de la fila y el nombre de la columna clave a la función borrar
            rowsCells += `<td><button onclick="deleteRow('${row.id_cliente}', 'id_cliente')" class="btn-delete">Eliminar</button></td>`;
        } 
        else if (currentTable === 'productos') {
            rowsCells = `
                <td><strong>${row.id_producto}</strong></td>
                <td>${row.nombre_producto}</td>
                <td>${row.stock_disponible}</td>
                <td>${row.stock_minimo}</td>
                <td>$${row.precio_unitario}</td>
                <td><button onclick="deleteRow('${row.id_producto}', 'id_producto')" class="btn-delete">Eliminar</button></td>
            `;
        } 
        else if (currentTable === 'pedidos') {
            rowsCells = `
                <td><strong>${row.id_pedido}</strong></td>
                <td>${row.fecha_pedido}</td>
                <td>${row.id_cliente}</td>
                <td>${row.validacion_tecnica}</td>
                <td><span class="badge">${row.estado_pedido}</span></td>
                <td><button onclick="deleteRow('${row.id_pedido}', 'id_pedido')" class="btn-delete">Eliminar</button></td>
            `;
        } 
        else if (currentTable === 'tecnicos') {
            rowsCells = `
                <td><strong>${row.id_tecnico}</strong></td>
                <td>${row.nombre_tecnico}</td>
                <td>${row.carga_trabajo_activa}</td>
                <td>${row.id_zona_asignada}</td>
                <td><button onclick="deleteRow('${row.id_tecnico}', 'id_tecnico')" class="btn-delete">Eliminar</button></td>
            `;
        }

        tr.innerHTML = rowsCells;
        tableBody.appendChild(tr);
    });
}

// =========================================================================
// FUNCIONALIDAD: ELIMINAR FILAS EN TIEMPO REAL (DELETE)
// =========================================================================

async function deleteRow(idValue, idColumnName) {
    // Cuadro de confirmación nativo del navegador por seguridad
    if (!confirm(`¿Estás completamente seguro de eliminar el registro ${idValue} de la tabla ${currentTable}?`)) {
        return;
    }

    if(clientMessage) {
        clientMessage.textContent = "Eliminando registro de la nube...";
        clientMessage.className = "message";
    }

    // Ejecuta la sentencia DELETE de Supabase: DELETE FROM tabla WHERE columna = id
    const { error } = await supabaseClient
        .from(currentTable)
        .delete()
        .eq(idColumnName, idValue);

    if (error) {
        console.error(error);
        // Si hay un error de clave foránea (ej. quieres borrar un cliente que ya tiene pedidos)
        if(error.code === '23503') {
            showFeedback(clientMessage, `No se puede eliminar: Este registro está vinculado con operaciones en otra tabla.`, 'error');
        } else {
            showFeedback(clientMessage, `Error al eliminar: ${error.message}`, 'error');
        }
    } else {
        showFeedback(clientMessage, `¡Registro ${idValue} eliminado con éxito de Supabase!`, 'success');
        loadTableData(); // Recarga la tabla de inmediato para ver el cambio
    }
}

// =========================================================================
// REGISTRO Y LOGIN DE USUARIOS
// =========================================================================

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

    const { data, error } = await supabaseClient
        .from('usuarios')
        .insert([{ username: username, password_hash: password }]); 

    if (error) {
        if (error.code === '23505') { 
            showFeedback(authMessage, 'El nombre de usuario ya está registrado.', 'error');
        } else {
            showFeedback(authMessage, `Error al registrar: ${error.message}`, 'error');
        }
    } else {
        showFeedback(authMessage, '¡Usuario creado con éxito!', 'success');
        registerForm.reset();
        setTimeout(() => switchAuthTab('login'), 1500);
    }
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    authMessage.textContent = "Verificando...";
    authMessage.className = "message";

    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    const { data, error } = await supabaseClient
        .from('usuarios')
        .select('*')
        .eq('username', username)
        .single(); 

    if (error || !data) {
        showFeedback(authMessage, 'Usuario no encontrado o error de red.', 'error');
        return;
    }

    if (data.password_hash === password) {
        localStorage.setItem('tecnoinnova_user', data.username); 
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

function showFeedback(element, text, type) {
    if(element) {
        element.textContent = text;
        element.className = `message ${type}`;
    }
}

document.addEventListener('DOMContentLoaded', checkSession);
