// =========================================================================
// CONFIGURACIÓN DE SUPABASE - INTEGRACIÓN COMPLETA (CRUD)
// =========================================================================
const SUPABASE_URL = "https://wxesqplgztzxayfxjyvg.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_qS9VyJvRyVpZdtzmFHypwQ_pY1ZCwDA";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Variables globales de control de estado
let currentTable = 'clientes'; 

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

// Elementos del nuevo Formulario Dinámico
const crudForm = document.getElementById('dynamic-crud-form');
const formTitle = document.getElementById('form-title');
const inputsArea = document.getElementById('dynamic-inputs-area');
const crudMode = document.getElementById('crud-mode');
const btnCancel = document.getElementById('btn-cancel-edit');

// =========================================================================
// LÓGICA DE NAVEGACIÓN Y SESIÓN
// =========================================================================

function switchAuthTab(tab) {
    if(authMessage) authMessage.textContent = "";
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
        if(userDisplay) userDisplay.textContent = sessionUser;
        authSection.classList.add('hidden');
        dashboardSection.classList.remove('hidden');
        changeTable('clientes'); // Arranca mostrando clientes
    } else {
        authSection.classList.remove('hidden');
        dashboardSection.classList.add('hidden');
    }
}

function logout() {
    localStorage.removeItem('tecnoinnova_user');
    checkSession();
}

// Cambiar de Pestaña de Tabla activa
function changeTable(tableName) {
    currentTable = tableName;
    document.querySelectorAll('.btn-tab').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`btn-tab-${tableName}`);
    if(activeBtn) activeBtn.classList.add('active');
    
    if(clientMessage) clientMessage.textContent = "";
    cancelEditing(); // Resetear el formulario al cambiar de sección
    loadTableData();
    buildDynamicFormInputs(); // Re-dibujar campos del formulario
}

// =========================================================================
// CONSTRUCTOR DINÁMICO DE FORMULARIOS (SE ADAPTA A LA TABLA ACTIVA)
// =========================================================================

function buildDynamicFormInputs() {
    formTitle.textContent = `Agregar Nuevo Registro (${currentTable.toUpperCase()})`;
    inputsArea.innerHTML = ''; // Vaciar campos anteriores

    let inputsHTML = '';

    if (currentTable === 'clientes') {
        inputsHTML = `
            <div class="form-group">
                <label>ID Cliente (Cédula/RUT/RUC)</label>
                <input type="text" id="field-id_cliente" required placeholder="Ej: CLI01">
            </div>
            <div class="form-group">
                <label>Nombre Completo</label>
                <input type="text" id="field-nombre" required placeholder="Ej: Juan Pérez">
            </div>
            <div class="form-group">
                <label>Teléfono</label>
                <input type="text" id="field-telefono" placeholder="Ej: +569123456">
            </div>
            <div class="form-group">
                <label>Correo Electrónico</label>
                <input type="email" id="field-correo" placeholder="Ej: juan@gmail.com">
            </div>
            <div class="form-group">
                <label>Historial Crediticio</label>
                <select id="field-historial_crediticio">
                    <option value="Excelente">Excelente</option>
                    <option value="Bueno">Bueno</option>
                    <option value="Regular" selected>Regular</option>
                    <option value="Malo">Malo</option>
                </select>
            </div>
            <div class="form-group">
                <label>ID Zona Operativa</label>
                <input type="text" id="field-id_zona" required placeholder="Ej: ZONA01">
            </div>
        `;
    } else if (currentTable === 'productos') {
        inputsHTML = `
            <div class="form-group">
                <label>ID Producto (Código)</label>
                <input type="text" id="field-id_producto" required placeholder="Ej: PROD01">
            </div>
            <div class="form-group">
                <label>Descripción del Producto</label>
                <input type="text" id="field-nombre_producto" required placeholder="Ej: Cámara Domo IP">
            </div>
            <div class="form-group">
                <label>Stock Disponible</label>
                <input type="number" id="field-stock_disponible" required min="0" value="10">
            </div>
            <div class="form-group">
                <label>Stock Mínimo de Seguridad</label>
                <input type="number" id="field-stock_minimo" required min="0" value="2">
            </div>
            <div class="form-group">
                <label>Precio Unitario ($)</label>
                <input type="number" id="field-precio_unitario" step="0.01" required min="0" placeholder="0.00">
            </div>
        `;
    } else if (currentTable === 'pedidos') {
        inputsHTML = `
            <div class="form-group">
                <label>ID Pedido</label>
                <input type="text" id="field-id_pedido" required placeholder="Ej: PED01">
            </div>
            <div class="form-group">
                <label>Fecha de Solicitud</label>
                <input type="date" id="field-fecha_pedido" required value="${new Date().toISOString().split('T')[0]}">
            </div>
            <div class="form-group">
                <label>ID Cliente Asociado</label>
                <input type="text" id="field-id_cliente" required placeholder="Ej: CLI01">
            </div>
            <div class="form-group">
                <label>Validación Técnica Inicial</label>
                <select id="field-validacion_tecnica">
                    <option value="Pendiente" selected>Pendiente</option>
                    <option value="Aprobado">Aprobado</option>
                    <option value="Rechazado">Rechazado</option>
                </select>
            </div>
            <div class="form-group">
                <label>Estado del Flujo Comercial</label>
                <select id="field-estado_pedido">
                    <option value="Solicitado" selected>Solicitado</option>
                    <option value="En Estudio">En Estudio</option>
                    <option value="Aprobado Financieramente">Aprobado Financieramente</option>
                    <option value="Instalado">Instalado</option>
                </select>
            </div>
        `;
    } else if (currentTable === 'tecnicos') {
        inputsHTML = `
            <div class="form-group">
                <label>ID Técnico</label>
                <input type="text" id="field-id_tecnico" required placeholder="Ej: TEC01">
            </div>
            <div class="form-group">
                <label>Nombre Completo del Técnico</label>
                <input type="text" id="field-nombre_tecnico" required placeholder="Ej: Carlos Técnico">
            </div>
            <div class="form-group">
                <label>Carga de Trabajo Activa</label>
                <input type="number" id="field-carga_trabajo_activa" required min="0" value="0">
            </div>
            <div class="form-group">
                <label>ID Zona Geográfica Asignada</label>
                <input type="text" id="field-id_zona_asignada" required placeholder="Ej: ZONA01">
            </div>
        `;
    }

    inputsArea.innerHTML = inputsHTML;
}

// =========================================================================
// RENDERIZADO DE TABLAS DE DATOS (READ)
// =========================================================================

async function loadTableData() {
    tableBody.innerHTML = '<tr><td colspan="10" class="text-center">Consultando Supabase...</td></tr>';
    
    let headHTML = '';
    let primaryKeyColumn = '';

    if (currentTable === 'clientes') {
        primaryKeyColumn = 'id_cliente';
        headHTML = `<tr><th>ID Cliente</th><th>Nombre</th><th>Teléfono</th><th>Correo</th><th>Crédito</th><th>Zona</th><th>Acciones</th></tr>`;
    } else if (currentTable === 'productos') {
        primaryKeyColumn = 'id_producto';
        headHTML = `<tr><th>ID Producto</th><th>Descripción</th><th>Stock Disp.</th><th>Stock Mín.</th><th>Precio</th><th>Acciones</th></tr>`;
    } else if (currentTable === 'pedidos') {
        primaryKeyColumn = 'id_pedido';
        headHTML = `<tr><th>ID Pedido</th><th>Fecha</th><th>ID Cliente</th><th>Val. Técnica</th><th>Estado</th><th>Acciones</th></tr>`;
    } else if (currentTable === 'tecnicos') {
        primaryKeyColumn = 'id_tecnico';
        headHTML = `<tr><th>ID Técnico</th><th>Nombre</th><th>Carga Trabajo</th><th>Zona Asignada</th><th>Acciones</th></tr>`;
    }

    tableHead.innerHTML = headHTML;

    const { data, error } = await supabaseClient
        .from(currentTable)
        .select('*')
        .order(primaryKeyColumn, { ascending: true });

    if (error) {
        tableBody.innerHTML = `<tr><td colspan="10" class="text-center error">Error SQL: ${error.message}</td></tr>`;
        return;
    }

    if (data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="10" class="text-center">No hay registros en esta tabla.</td></tr>`;
        return;
    }

    tableBody.innerHTML = '';
    data.forEach(row => {
        const tr = document.createElement('tr');
        let rowsCells = '';
        
        // Convertimos el registro a un string seguro para pasarlo a la función de editar
        const safeRowData = btoa(unescape(encodeURIComponent(JSON.stringify(row))));

        if (currentTable === 'clientes') {
            rowsCells = `
                <td><strong>${row.id_cliente}</strong></td><td>${row.nombre}</td><td>${row.telefono || 'N/A'}</td>
                <td>${row.correo || 'N/A'}</td><td><span class="badge">${row.historial_crediticio}</span></td><td>${row.id_zona}</td>
            `;
        } else if (currentTable === 'productos') {
            rowsCells = `
                <td><strong>${row.id_producto}</strong></td><td>${row.nombre_producto}</td><td>${row.stock_disponible}</td>
                <td>${row.stock_minimo}</td><td>$${row.precio_unitario}</td>
            `;
        } else if (currentTable === 'pedidos') {
            rowsCells = `
                <td><strong>${row.id_pedido}</strong></td><td>${row.fecha_pedido}</td><td>${row.id_cliente}</td>
                <td>${row.validacion_tecnica}</td><td><span class="badge">${row.estado_pedido}</span></td>
            `;
        } else if (currentTable === 'tecnicos') {
            rowsCells = `
                <td><strong>${row.id_tecnico}</strong></td><td>${row.nombre_tecnico}</td><td>${row.carga_trabajo_activa}</td><td>${row.id_zona_asignada}</td>
            `;
        }

        // AGREGAR BOTONES DE EDITAR Y ELIMINAR A CADA FILA DE FORMA ESTÁNDAR
        const idActual = row[primaryKeyColumn];
        rowsCells += `
            <td>
                <button onclick="startEditing('${safeRowData}')" class="btn-tab" style="background:#3182ce;color:white;padding:3px 8px;font-size:0.8rem;margin-right:4px;">Editar</button>
                <button onclick="deleteRow('${idActual}', '${primaryKeyColumn}')" class="btn-delete" style="padding:3px 8px;font-size:0.8rem;">Eliminar</button>
            </td>
        `;
        tr.innerHTML = rowsCells;
        tableBody.appendChild(tr);
    });
}

// =========================================================================
// ACCIÓN: PROCESAR INSERCIÓN O ACTUALIZACIÓN (GUARDAR - UPSERT)
// =========================================================================

crudForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    showFeedback(clientMessage, 'Guardando en la nube de Supabase...', 'info');

    // Construir el objeto de datos dinámicamente extrayendo los valores de los inputs cargados
    const payload = {};
    const inputs = inputsArea.querySelectorAll('input, select');
    
    inputs.forEach(input => {
        const key = input.id.replace('field-', ''); // Recuperamos el nombre de la columna real
        let value = input.value.trim();
        
        // Conversión a tipo numérico si es necesario
        if (input.type === 'number') {
            value = value.includes('.') ? parseFloat(value) : parseInt(value, 10);
        }
        if (value === '') value = null;
        
        // Poner las claves principales siempre en mayúsculas por orden de base de datos
        if (key.startsWith('id_') && typeof value === 'string') {
            value = value.toUpperCase();
        }

        payload[key] = value;
    });

    // .upsert() guarda si no existe, o actualiza si la Clave Primaria coincide.
    const { data, error } = await supabaseClient
        .from(currentTable)
        .upsert([payload]);

    if (error) {
        console.error(error);
        showFeedback(clientMessage, `Error de consistencia SQL: ${error.message}`, 'error');
    } else {
        showFeedback(clientMessage, `¡Registro procesado con éxito en la tabla ${currentTable}!`, 'success');
        cancelEditing();
        loadTableData();
    }
});

// =========================================================================
// ACCIÓN: COLOCAR DATOS EN EL FORMULARIO PARA EDITAR (UPDATE)
// =========================================================================

function startEditing(encodedRowData) {
    const row = JSON.parse(decodeURIComponent(escape(atob(encodedRowData))));
    
    crudMode.value = "UPDATE";
    formTitle.textContent = `Modificando Registro Activo (${currentTable.toUpperCase()})`;
    if(btnCancel) btnCancel.classList.remove('hidden');

    // Rellenar cada input con el valor que tiene actualmente en Supabase
    for (const key in row) {
        const inputField = document.getElementById(`field-${key}`);
        if (inputField) {
            inputField.value = row[key];
            
            // Bloquear el campo ID si estamos editando (las llaves primarias no se deben alterar)
            if (key.startsWith('id_')) {
                inputField.readOnly = true;
                inputField.style.background = "#e2e8f0";
            }
        }
    }
    
    // Enfocar el scroll hacia el formulario
    crudForm.scrollIntoView({ behavior: 'smooth' });
}

function cancelEditing() {
    crudMode.value = "CREATE";
    if(btnCancel) btnCancel.classList.add('hidden');
    crudForm.reset();
    buildDynamicFormInputs(); // Regenera campos limpios y quita los readOnly
}

// =========================================================================
// ACCIÓN: BORRAR FILAS DE LA BASE DE DATOS (DELETE)
// =========================================================================

async function deleteRow(idValue, idColumnName) {
    if (!confirm(`¿Deseas eliminar el registro [ ${idValue} ] de la tabla ${currentTable} en Supabase?`)) return;

    showFeedback(clientMessage, 'Procesando eliminación...', 'info');

    const { error } = await supabaseClient
        .from(currentTable)
        .delete()
        .eq(idColumnName, idValue);

    if (error) {
        if(error.code === '23503') {
            showFeedback(clientMessage, 'Error estructural: No puedes borrar este registro porque tiene dependencias relacionales en otras tablas.', 'error');
        } else {
            showFeedback(clientMessage, `Error: ${error.message}`, 'error');
        }
    } else {
        showFeedback(clientMessage, 'Registro eliminado correctamente de la nube.', 'success');
        cancelEditing();
        loadTableData();
    }
}

// =========================================================================
// SISTEMA DE USUARIOS SIMULADO DE RESPUESTA DIRECTA
// =========================================================================

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value;
    if (password.length < 6) { return showFeedback(authMessage, 'Mínimo 6 caracteres.', 'error'); }

    const { error } = await supabaseClient.from('usuarios').insert([{ username, password_hash: password }]); 
    if (error) {
        showFeedback(authMessage, error.code === '23505' ? 'El usuario ya existe.' : error.message, 'error');
    } else {
        showFeedback(authMessage, 'Creado con éxito.', 'success');
        setTimeout(() => switchAuthTab('login'), 1500);
    }
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    const { data, error } = await supabaseClient.from('usuarios').select('*').eq('username', username).single(); 
    if (error || !data || data.password_hash !== password) {
        showFeedback(authMessage, 'Credenciales incorrectas.', 'error');
    } else {
        localStorage.setItem('tecnoinnova_user', data.username);
        checkSession();
    }
});

function showFeedback(element, text, type) {
    if(element) {
        element.textContent = text;
        element.className = `message ${type}`;
    }
}

document.addEventListener('DOMContentLoaded', checkSession);
