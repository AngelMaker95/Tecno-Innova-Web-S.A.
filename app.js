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
        changeTable(currentTable || 'clientes'); 
    } else {
        authSection.classList.remove('hidden');
        dashboardSection.classList.add('hidden');
    }
}

function logout() {
    localStorage.removeItem('tecnoinnova_user');
    checkSession();
}

function changeTable(tableName) {
    currentTable = tableName;
    document.querySelectorAll('.btn-tab').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`btn-tab-${tableName}`);
    if(activeBtn) activeBtn.classList.add('active');
    
    if(clientMessage) {
        clientMessage.textContent = "";
        clientMessage.className = "message"; // Resetear clases de alerta
    }
    cancelEditing(); 
    loadTableData();
    buildDynamicFormInputs(); 
}

// =========================================================================
// CONSTRUCTOR DINÁMICO DE FORMULARIOS
// =========================================================================

function buildDynamicFormInputs() {
    formTitle.innerHTML = `<span class="table-tag">${currentTable.toUpperCase()}</span> Agregar Registro`;
    inputsArea.innerHTML = ''; 

    let inputsHTML = '';

    if (currentTable === 'clientes') {
        inputsHTML = `
            <div class="form-group">
                <label>ID Cliente (Cédula/RUT)</label>
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
                <label>Stock Mínimo</label>
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
                <label>Nombre Completo</label>
                <input type="text" id="field-nombre_tecnico" required placeholder="Ej: Carlos Técnico">
            </div>
            <div class="form-group">
                <label>Carga de Trabajo Activa</label>
                <input type="number" id="field-carga_trabajo_activa" required min="0" value="0">
            </div>
            <div class="form-group">
                <label>ID Zona Asignada</label>
                <input type="text" id="field-id_zona_asignada" required placeholder="Ej: ZONA01">
            </div>
        `;
    }

    inputsArea.innerHTML = inputsHTML;
}

// =========================================================================
// RENDERIZADO DE TABLAS DE DATOS
// =========================================================================

async function loadTableData() {
    tableBody.innerHTML = '<tr><td colspan="10" class="text-center loading-status">Consultando base de datos segura...</td></tr>';
    
    let headHTML = '';
    let primaryKeyColumn = '';

    if (currentTable === 'clientes') {
        primaryKeyColumn = 'id_cliente';
        headHTML = `<tr><th>ID Cliente</th><th>Nombre</th><th>Teléfono</th><th>Correo</th><th>Crédito</th><th>Zona</th><th class="text-center">Acciones</th></tr>`;
    } else if (currentTable === 'productos') {
        primaryKeyColumn = 'id_producto';
        headHTML = `<tr><th>ID Producto</th><th>Descripción</th><th>Stock Disp.</th><th>Stock Mín.</th><th>Precio</th><th class="text-center">Acciones</th></tr>`;
    } else if (currentTable === 'pedidos') {
        primaryKeyColumn = 'id_pedido';
        headHTML = `<tr><th>ID Pedido</th><th>Fecha</th><th>ID Cliente</th><th>Val. Técnica</th><th>Estado</th><th class="text-center">Acciones</th></tr>`;
    } else if (currentTable === 'tecnicos') {
        primaryKeyColumn = 'id_tecnico';
        headHTML = `<tr><th>ID Técnico</th><th>Nombre</th><th>Carga Trabajo</th><th>Zona Asignada</th><th class="text-center">Acciones</th></tr>`;
    }

    tableHead.innerHTML = headHTML;

    const { data, error } = await supabaseClient
        .from(currentTable)
        .select('*')
        .order(primaryKeyColumn, { ascending: true });

    if (error) {
        tableBody.innerHTML = `<tr><td colspan="10" class="text-center status-error">Error SQL: ${error.message}</td></tr>`;
        return;
    }

    if (data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="10" class="text-center status-empty">No hay registros disponibles en esta sección.</td></tr>`;
        return;
    }

    tableBody.innerHTML = '';
    data.forEach(row => {
        const tr = document.createElement('tr');
        let rowsCells = '';
        
        const safeRowData = btoa(unescape(encodeURIComponent(JSON.stringify(row))));

        // Clasificación visual limpia usando clases dinámicastoLowerCase() para CSS
        if (currentTable === 'clientes') {
            const creditClass = `badge-${row.historial_crediticio.toLowerCase()}`;
            rowsCells = `
                <td><span class="id-pill">${row.id_cliente}</span></td>
                <td><strong>${row.nombre}</strong></td>
                <td>${row.telefono || '—'}</td>
                <td class="text-muted">${row.correo || '—'}</td>
                <td><span class="badge ${creditClass}">${row.historial_crediticio}</span></td>
                <td><span class="zone-pill">${row.id_zona}</span></td>
            `;
        } else if (currentTable === 'productos') {
            const isLowStock = row.stock_disponible <= row.stock_minimo ? 'stock-danger' : 'stock-normal';
            rowsCells = `
                <td><span class="id-pill">${row.id_producto}</span></td>
                <td><strong>${row.nombre_producto}</strong></td>
                <td><span class="${isLowStock}">${row.stock_disponible}</span></td>
                <td class="text-muted">${row.stock_minimo}</td>
                <td class="price-tag">$${parseFloat(row.precio_unitario).toFixed(2)}</td>
            `;
        } else if (currentTable === 'pedidos') {
            const techClass = `badge-${row.validacion_tecnica.toLowerCase()}`;
            const flowClass = `status-${row.estado_pedido.toLowerCase().replace(/ /g, '-')}`;
            rowsCells = `
                <td><span class="id-pill">${row.id_pedido}</span></td>
                <td class="text-muted">${row.fecha_pedido}</td>
                <td><span class="zone-pill">${row.id_cliente}</span></td>
                <td><span class="badge ${techClass}">${row.validacion_tecnica}</span></td>
                <td><span class="status-dot ${flowClass}">${row.estado_pedido}</span></td>
            `;
        } else if (currentTable === 'tecnicos') {
            rowsCells = `
                <td><span class="id-pill">${row.id_tecnico}</span></td>
                <td><strong>${row.nombre_tecnico}</strong></td>
                <td><span class="workload-counter">${row.carga_trabajo_activa}</span></td>
                <td><span class="zone-pill">${row.id_zona_asignada}</span></td>
            `;
        }

        // El JavaScript ya NO tiene estilos en línea rígidos, usa clases visuales puras.
        const idActual = row[primaryKeyColumn];
        rowsCells += `
            <td class="text-center actions-cell">
                <button onclick="startEditing('${safeRowData}')" class="btn-action btn-edit" title="Editar Registro">
                    <i>✏️</i> Editar
                </button>
                <button onclick="deleteRow('${idActual}', '${primaryKeyColumn}')" class="btn-action btn-delete" title="Eliminar Registro">
                    <i>🗑️</i>
                </button>
            </td>
        `;
        tr.innerHTML = rowsCells;
        tableBody.appendChild(tr);
    });
}

// =========================================================================
// ACCIONES: CONTROL FORMULARIO (UPSERT, EDIT, DELETE)
// =========================================================================

crudForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    showFeedback(clientMessage, 'Sincronizando con TecnoInnova Cloud...', 'info');

    const payload = {};
    const inputs = inputsArea.querySelectorAll('input, select');
    
    inputs.forEach(input => {
        const key = input.id.replace('field-', ''); 
        let value = input.value.trim();
        
        if (input.type === 'number') {
            value = value.includes('.') ? parseFloat(value) : parseInt(value, 10);
        }
        if (value === '') value = null;
        
        if (key.startsWith('id_') && typeof value === 'string') {
            value = value.toUpperCase();
        }

        payload[key] = value;
    });

    const { error } = await supabaseClient
        .from(currentTable)
        .upsert([payload]);

    if (error) {
        showFeedback(clientMessage, `Error de consistencia SQL: ${error.message}`, 'error');
    } else {
        showFeedback(clientMessage, `¡Tabla [${currentTable.toUpperCase()}] actualizada correctamente!`, 'success');
        cancelEditing();
        loadTableData();
    }
});

function startEditing(encodedRowData) {
    const row = JSON.parse(decodeURIComponent(escape(atob(encodedRowData))));
    
    crudMode.value = "UPDATE";
    formTitle.innerHTML = `<span class="table-tag tag-update">EDITANDO</span> Modificar Registro`;
    if(btnCancel) btnCancel.classList.remove('hidden');

    crudForm.classList.add('form-editing-active');

    for (const key in row) {
        const inputField = document.getElementById(`field-${key}`);
        if (inputField) {
            inputField.value = row[key];
            
            if (key.startsWith('id_')) {
                inputField.readOnly = true;
                inputField.classList.add('readonly-field'); // Asignación de diseño vía CSS
            }
        }
    }
    
    crudForm.scrollIntoView({ behavior: 'smooth' });
}

function cancelEditing() {
    crudMode.value = "CREATE";
    if(btnCancel) btnCancel.classList.add('hidden');
    crudForm.reset();
    crudForm.classList.remove('form-editing-active');
    buildDynamicFormInputs(); 
}

async function deleteRow(idValue, idColumnName) {
    if (!confirm(`¿Estás seguro de eliminar permanentemente el registro [ ${idValue} ] de la tabla ${currentTable}?`)) return;

    showFeedback(clientMessage, 'Eliminando registro de la base de datos...', 'info');

    const { error } = await supabaseClient
        .from(currentTable)
        .delete()
        .eq(idColumnName, idValue);

    if (error) {
        if(error.code === '23503') {
            showFeedback(clientMessage, 'No se puede eliminar: Este registro está vinculado a otras operaciones activas.', 'error');
        } else {
            showFeedback(clientMessage, `Error: ${error.message}`, 'error');
        }
    } else {
        showFeedback(clientMessage, 'Registro removido exitosamente.', 'success');
        cancelEditing();
        loadTableData();
    }
}

// =========================================================================
// SISTEMA DE AUTENTICACIÓN
// =========================================================================

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value;
    if (password.length < 6) { return showFeedback(authMessage, 'La contraseña debe tener mínimo 6 caracteres.', 'error'); }

    const { error } = await supabaseClient.from('usuarios').insert([{ username, password_hash: password }]); 
    if (error) {
        showFeedback(authMessage, error.code === '23505' ? 'El nombre de usuario ya se encuentra registrado.' : error.message, 'error');
    } else {
        showFeedback(authMessage, 'Cuenta creada. Redirigiendo...', 'success');
        setTimeout(() => switchAuthTab('login'), 1500);
    }
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    const { data, error } = await supabaseClient.from('usuarios').select('*').eq('username', username).single(); 
    if (error || !data || data.password_hash !== password) {
        showFeedback(authMessage, 'Usuario o contraseña inválidos.', 'error');
    } else {
        localStorage.setItem('tecnoinnova_user', data.username);
        checkSession();
    }
});

function showFeedback(element, text, type) {
    if(element) {
        element.textContent = text;
        element.className = `message msg-${type}`; // Estilos controlados por CSS
    }
}

document.addEventListener('DOMContentLoaded', checkSession);
