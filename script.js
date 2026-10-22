// Plan de Estudios: Licenciatura en Ciencias de la Computación (UNC)
const planCarrera = [
  { id: "0001", nombre: "Curso de Nivelación", anio: 0, cuatrimestre: 0, correlativas: [] },
  { id: "0031", nombre: "Matemática Discreta I", anio: 1, cuatrimestre: 1, correlativas: ["0001"] },
  { id: "0032", nombre: "Análisis Matemático I", anio: 1, cuatrimestre: 1, correlativas: ["0001"] },
  { id: "0033", nombre: "Introducción a los Algoritmos", anio: 1, cuatrimestre: 1, correlativas: ["0001"] },
  { id: "0048", nombre: "Algoritmos y Estructuras de Datos I", anio: 1, cuatrimestre: 2, correlativas: ["0033"] },
  { id: "0055", nombre: "Álgebra", anio: 1, cuatrimestre: 2, correlativas: ["0031"] },
  { id: "0056", nombre: "Análisis Matemático II", anio: 1, cuatrimestre: 2, correlativas: ["0032"] },
  { id: "0145", nombre: "Algoritmos y Estructuras de Datos II", anio: 2, cuatrimestre: 1, correlativas: ["0048"] },
  { id: "0147", nombre: "Organización del Computador", anio: 2, cuatrimestre: 1, correlativas: ["0048"] },
  { id: "0240", nombre: "Análisis Numérico", anio: 2, cuatrimestre: 1, correlativas: ["0055", "0056"] }, 
  { id: "0220", nombre: "Introducción a la Lógica y la Computación", anio: 2, cuatrimestre: 2, correlativas: ["0031", "0048"] },
  { id: "0151", nombre: "Probabilidad y Estadística", anio: 2, cuatrimestre: 2, correlativas: ["0032", "0048"] },
  { id: "0230", nombre: "Sistemas Operativos", anio: 2, cuatrimestre: 2, correlativas: ["0147"] },
  { id: "0143", nombre: "Matemática Discreta II", anio: 3, cuatrimestre: 1, correlativas: ["0031", "0145"] },
  { id: "0248", nombre: "Paradigmas de Programación", anio: 3, cuatrimestre: 1, correlativas: ["0145"] },
  { id: "0639", nombre: "Redes y Sistemas Distribuidos", anio: 3, cuatrimestre: 1, correlativas: ["0145", "0230"] },
  { id: "0465", nombre: "Bases de Datos", anio: 3, cuatrimestre: 2, correlativas: ["0145", "0230"] },
  { id: "0469", nombre: "Arquitectura de Computadoras", anio: 3, cuatrimestre: 2, correlativas: ["0230"] },
  { id: "0640", nombre: "Ingeniería del Software I", anio: 3, cuatrimestre: 2, correlativas: ["0145"] },
  { id: "0642", nombre: "Lenguajes Formales y Computabilidad", anio: 4, cuatrimestre: 1, correlativas: ["0220"] },
  { id: "0643", nombre: "Modelos y Simulación", anio: 4, cuatrimestre: 1, correlativas: ["0048", "0151"] },
  { id: "0148", nombre: "Física", anio: 4, cuatrimestre: 2, correlativas: ["0056"] },
  { id: "0645", nombre: "Lógica", anio: 4, cuatrimestre: 2, correlativas: ["0220"] },
  { id: "0644", nombre: "Ingeniería del Software II", anio: 5, cuatrimestre: 1, correlativas: ["0640"] },
  { id: "0646", nombre: "Lenguajes y Compiladores", anio: 5, cuatrimestre: 1, correlativas: ["0642", "0645"] },
  { id: "0822", nombre: "Materias Optativas", anio: 5, cuatrimestre: 2, correlativas: [] },
  { id: "0821", nombre: "Trabajo Especial", anio: 5, cuatrimestre: 2, correlativas: ["0143", "0248", "0639", "0465", "0469", "0640", "0642", "0643", "0645", "0148"] }
];

let progresoUsuario = JSON.parse(localStorage.getItem('progreso_carrera')) || {};
let materiaSeleccionadaId = null;
let filtroActual = 'todos';
let textoBusqueda = '';

// MODO OSCURO / CLARO
const btnThemeToggle = document.getElementById('btn-theme-toggle');
if (localStorage.getItem('modo_oscuro') === 'true') {
  document.body.classList.add('dark-mode');
  btnThemeToggle.innerText = '☀️';
}

btnThemeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const esOscuro = document.body.classList.contains('dark-mode');
  localStorage.setItem('modo_oscuro', esOscuro);
  btnThemeToggle.innerText = esOscuro ? '☀️' : '🌙';
});

// EXPORTAR A PDF (Genera un certificado analítico impreso/descargable)
document.getElementById('btn-exportar').addEventListener('click', () => {
  let totalAprobadas = 0;
  let sumaNotas = 0;
  let totalExamenes = 0;
  let detalleMaterias = "";

  planCarrera.forEach(m => {
    const estadoInfo = obtenerEstadoMateria(m);
    if (estadoInfo.esAprobada) {
      totalAprobadas++;
      detalleMaterias += `<li><strong>${m.nombre}</strong> (Año ${m.anio}): ${estadoInfo.estadoTexto}</li>`;
    }
    const datos = progresoUsuario[m.id];
    if (datos && !tieneLaboratoriosDesaprobados(datos.laboratorios)) {
      if (datos.intentosFinales && datos.intentosFinales.length > 0) {
        datos.intentosFinales.forEach(n => { const v = parseFloat(n); if(!isNaN(v)) { sumaNotas += v; totalExamenes++; } });
      } else if (datos.aprobada) {
        const p = calcularPromedio(datos.parciales);
        if(p) { sumaNotas += parseFloat(p); totalExamenes++; }
      }
    }
  });

  const porcentaje = Math.round((totalAprobadas / planCarrera.length) * 100);
  const promedioGeneral = totalExamenes > 0 ? (sumaNotas / totalExamenes).toFixed(2) : '-';

  // Abrir ventana para imprimir o guardar como PDF
  const ventanaPdf = window.open('', '_blank');
  ventanaPdf.document.write(`
    <html>
      <head>
        <title>Certificado de Analítico - Lic. en Ciencias de la Computación</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 30px; color: #1e293b; }
          h1 { color: #0f172a; border-bottom: 2px solid #cbd5e1; padding-bottom: 10px; }
          .metrics { background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0; }
          ul { line-height: 1.6; }
        </style>
      </head>
      <body>
        <h1>Certificado de Estado Académico</h1>
        <p><strong>Carrera:</strong> Licenciatura en Ciencias de la Computación (Plan 2002 - UNC)</p>
        <div class="metrics">
          <p><strong>Avance de Carrera:</strong> ${porcentaje}% (${totalAprobadas}/${planCarrera.length} materias)</p>
          <p><strong>Promedio Analítico General:</strong> ${promedioGeneral}</p>
        </div>
        <h2>Materias Aprobadas / Registradas</h2>
        <ul>${detalleMaterias || '<li>No hay materias aprobadas todavía.</li>'}</ul>
        <script>window.print();</script>
      </body>
    </html>
  `);
  ventanaPdf.document.close();
});

// BUSCADOR Y FILTROS
document.getElementById('input-buscar').addEventListener('input', (e) => {
  textoBusqueda = e.target.value.toLowerCase().trim();
  renderizarCarrera();
});

document.querySelectorAll('.btn-filtro').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.btn-filtro').forEach(b => b.classList.remove('activo'));
    e.target.classList.add('activo');
    filtroActual = e.target.getAttribute('data-filtro');
    renderizarCarrera();
  });
});

function guardarProgreso() {
  localStorage.setItem('progreso_carrera', JSON.stringify(progresoUsuario));
  renderizarCarrera();
}

function esDesbloqueada(materia) {
  if (materia.correlativas.length === 0) return true;
  return materia.correlativas.every(idCorr => {
    const estadoCorr = progresoUsuario[idCorr];
    if (!estadoCorr) return false;
    return estadoCorr.aprobada || estadoCorr.condicion === 'regular' || estadoCorr.condicion === 'promocionado';
  });
}

function calcularPromedio(notas) {
  const notasNum = (notas || []).map(n => parseFloat(n)).filter(n => !isNaN(n));
  if (notasNum.length === 0) return null;
  return (notasNum.reduce((a, b) => a + b, 0) / notasNum.length).toFixed(2);
}

function tieneLaboratoriosDesaprobados(labs) {
  if (!labs || labs.length === 0) return false;
  return labs.some(l => l === 'desaprobado');
}

function obtenerEstadoMateria(materia) {
  const datosUsuario = progresoUsuario[materia.id] || { 
    aprobada: false, 
    parciales: [], 
    laboratorios: [],
    intentosFinales: [], 
    numCursada: 1,
    condicion: 'pendiente'
  };

  const desbloqueada = esDesbloqueada(materia);
  const promedioParciales = calcularPromedio(datosUsuario.parciales);
  const ultFinal = datosUsuario.intentosFinales && datosUsuario.intentosFinales.length > 0 
    ? datosUsuario.intentosFinales[datosUsuario.intentosFinales.length - 1] 
    : null;

  let claseEstado = 'bloqueada';
  let estadoTexto = 'Inhabilitada';
  const labDesaprobado = tieneLaboratoriosDesaprobados(datosUsuario.laboratorios);

  if (datosUsuario.aprobada && !labDesaprobado) {
    claseEstado = 'aprobada';
    if (ultFinal !== null && ultFinal !== '') {
      estadoTexto = `Aprobada (Nota: ${ultFinal})`;
    } else if (promedioParciales) {
      estadoTexto = `Aprobada (Prom: ${promedioParciales})`;
    } else {
      estadoTexto = `Aprobada`;
    }
  } else if (datosUsuario.condicion === 'regular' && !labDesaprobado) {
    claseEstado = 'regular';
    estadoTexto = `Regularizada (Pendiente Final)`;
  } else if (labDesaprobado) {
    claseEstado = 'bloqueada';
    estadoTexto = `Libre (Lab desaprobado)`;
  } else if (desbloqueada) {
    if ((datosUsuario.parciales && datosUsuario.parciales.length > 0) || (datosUsuario.laboratorios && datosUsuario.laboratorios.length > 0)) {
      claseEstado = 'cursando';
      estadoTexto = `Cursando (Prom: ${promedioParciales || 'S/N'})`;
    } else {
      claseEstado = 'habilitada';
      estadoTexto = `Habilitada para Cursar`;
    }
  }

  return { claseEstado, estadoTexto, desbloqueada, esAprobada: datosUsuario.aprobada && !labDesaprobado, datosUsuario };
}

function crearTarjetaMateria(materia) {
  const estadoInfo = obtenerEstadoMateria(materia);
  
  const coincideBusqueda = materia.nombre.toLowerCase().includes(textoBusqueda);
  const coincideFiltro = filtroActual === 'todos' || estadoInfo.claseEstado === filtroActual;

  const card = document.createElement('div');
  if (!coincideBusqueda || !coincideFiltro) {
    card.style.display = 'none';
  }

  let extraInfo = '';
  if (estadoInfo.datosUsuario.numCursada > 1) {
    extraInfo += `<span>${estadoInfo.datosUsuario.numCursada}° Cursada</span>`;
  }
  if (estadoInfo.datosUsuario.intentosFinales && estadoInfo.datosUsuario.intentosFinales.length > 0) {
    if (extraInfo) extraInfo += ' • ';
    extraInfo += `<span>${estadoInfo.datosUsuario.intentosFinales.length} final(es)</span>`;
  }

  card.className = `materia-card ${estadoInfo.claseEstado}`;
  card.innerHTML = `
    <strong>${materia.nombre}</strong><br>
    <span class="estado-badge">${estadoInfo.estadoTexto}</span>
    ${extraInfo ? `<div class="materia-info-extra">${extraInfo}</div>` : ''}
  `;

  if (estadoInfo.desbloqueada || estadoInfo.datosUsuario.aprobada || estadoInfo.datosUsuario.condicion === 'regular') {
    card.addEventListener('click', () => abrirModal(materia.id));
  }

  return { card, esAprobada: estadoInfo.esAprobada };
}

function actualizarMetricasGenerales() {
  let totalAprobadas = 0;
  let sumaNotasAnalitico = 0;
  let totalExamenesAnalitico = 0;

  planCarrera.forEach(materia => {
    const estadoInfo = obtenerEstadoMateria(materia);
    if (estadoInfo.esAprobada) totalAprobadas++;

    const datos = progresoUsuario[materia.id];
    if (datos && !tieneLaboratoriosDesaprobados(datos.laboratorios)) {
      if (datos.intentosFinales && datos.intentosFinales.length > 0) {
        datos.intentosFinales.forEach(nota => {
          const val = parseFloat(nota);
          if (!isNaN(val)) { sumaNotasAnalitico += val; totalExamenesAnalitico++; }
        });
      } else if (datos.aprobada) {
        const promP = calcularPromedio(datos.parciales);
        if (promP) { sumaNotasAnalitico += parseFloat(promP); totalExamenesAnalitico++; }
      }
    }
  });

  const porcentaje = Math.round((totalAprobadas / planCarrera.length) * 100);
  document.getElementById('porcentaje-texto').innerText = `${porcentaje}% (${totalAprobadas}/${planCarrera.length})`;
  document.getElementById('progress-fill').style.width = `${porcentaje}%`;

  const elemProm = document.getElementById('promedio-analitico');
  const elemTotalEx = document.getElementById('total-intentos-texto');

  if (totalExamenesAnalitico > 0) {
    const promGeneral = (sumaNotasAnalitico / totalExamenesAnalitico).toFixed(2);
    elemProm.innerText = promGeneral;
    elemTotalEx.innerText = `${totalExamenesAnalitico} nota(s) en analítico`;
  } else {
    elemProm.innerText = '-';
    elemTotalEx.innerText = '0 exámenes computados';
  }
}

function renderizarCarrera() {
  const container = document.getElementById('carrera-container');
  container.innerHTML = '';

  const nivelacion = planCarrera.find(m => m.id === "0001");
  if (nivelacion) {
    const bloqueNiv = document.createElement('div');
    bloqueNiv.className = 'nivelacion-bloque';
    bloqueNiv.innerHTML = `<h2 class="anio-titulo">Ingreso</h2>`;
    const gridNiv = document.createElement('div');
    gridNiv.className = 'grid-materias';
    const res = crearTarjetaMateria(nivelacion);
    gridNiv.appendChild(res.card);
    bloqueNiv.appendChild(gridNiv);
    container.appendChild(bloqueNiv);
  }

  const anios = [1, 2, 3, 4, 5];
  anios.forEach(anio => {
    const materiasAnio = planCarrera.filter(m => m.anio === anio);
    if (materiasAnio.length === 0) return;

    const bloqueAnio = document.createElement('div');
    bloqueAnio.className = 'anio-bloque';
    bloqueAnio.innerHTML = `<h2 class="anio-titulo">${anio}° Año</h2>`;

    [1, 2].forEach(cuatri => {
      const matCuatri = materiasAnio.filter(m => m.cuatrimestre === cuatri);
      if (matCuatri.length > 0) {
        const bloqueC = document.createElement('div');
        bloqueC.className = 'cuatrimestre-bloque';
        bloqueC.innerHTML = `<div class="cuatrimestre-titulo">${cuatri}° Cuatrimestre</div>`;
        const grid = document.createElement('div');
        grid.className = 'grid-materias';
        matCuatri.forEach(m => {
          const res = crearTarjetaMateria(m);
          grid.appendChild(res.card);
        });
        bloqueC.appendChild(grid);
        bloqueAnio.appendChild(bloqueC);
      }
    });

    container.appendChild(bloqueAnio);
  });

  actualizarMetricasGenerales();
}

function abrirModal(id) {
  materiaSeleccionadaId = id;
  const materia = planCarrera.find(m => m.id === id);
  const datos = progresoUsuario[id] || { 
    aprobada: false, 
    parciales: [], 
    laboratorios: [],
    intentosFinales: [], 
    numCursada: 1,
    condicion: 'pendiente'
  };

  document.getElementById('modal-titulo').innerText = materia.nombre;
  document.getElementById('numero-cursada').value = datos.numCursada || 1;
  document.getElementById('select-condicion').value = datos.condicion || 'pendiente';

  const listaParciales = document.getElementById('lista-parciales');
  listaParciales.innerHTML = '';
  if (datos.parciales && datos.parciales.length > 0) {
    datos.parciales.forEach((nota, index) => agregarInputParcial(index + 1, nota));
  } else {
    agregarInputParcial(1);
  }

  const listaLabs = document.getElementById('lista-laboratorios');
  listaLabs.innerHTML = '';
  if (datos.laboratorios && datos.laboratorios.length > 0) {
    datos.laboratorios.forEach((estado, index) => agregarInputLab(index + 1, estado));
  }

  const listaFinales = document.getElementById('lista-finales');
  listaFinales.innerHTML = '';
  if (datos.intentosFinales && datos.intentosFinales.length > 0) {
    datos.intentosFinales.forEach((nota, index) => agregarInputFinal(index + 1, nota));
  }

  document.getElementById('modal-materia').classList.remove('hidden');
}

function agregarInputParcial(num, valor = '') {
  const lista = document.getElementById('lista-parciales');
  const div = document.createElement('div');
  div.className = 'parcial-row';
  div.innerHTML = `
    <span>Parcial ${num}:</span>
    <input type="number" min="1" max="10" step="0.5" class="input-nota-parcial" value="${valor}" placeholder="Nota">
  `;
  lista.appendChild(div);
}

function agregarInputLab(num, valor = 'aprobado') {
  const lista = document.getElementById('lista-laboratorios');
  const div = document.createElement('div');
  div.className = 'lab-row';
  div.innerHTML = `
    <span>Lab ${num}:</span>
    <select class="select-lab">
      <option value="aprobado" ${valor === 'aprobado' ? 'selected' : ''}>Aprobado</option>
      <option value="desaprobado" ${valor === 'desaprobado' ? 'selected' : ''}>Desaprobado</option>
    </select>
  `;
  lista.appendChild(div);
}

function agregarInputFinal(num, valor = '') {
  const lista = document.getElementById('lista-finales');
  const div = document.createElement('div');
  div.className = 'final-row';
  div.innerHTML = `
    <span>Intento ${num}:</span>
    <input type="number" min="1" max="10" step="0.5" class="input-nota-final" value="${valor}" placeholder="Nota (Ej: 2, 4, 8)">
  `;
  lista.appendChild(div);
}

document.getElementById('btn-agregar-parcial').addEventListener('click', () => {
  const count = document.querySelectorAll('.input-nota-parcial').length + 1;
  agregarInputParcial(count);
});

document.getElementById('btn-agregar-lab').addEventListener('click', () => {
  const count = document.querySelectorAll('.lab-row').length + 1;
  agregarInputLab(count, 'aprobado');
});

document.getElementById('btn-agregar-final').addEventListener('click', () => {
  const count = document.querySelectorAll('.input-nota-final').length + 1;
  agregarInputFinal(count);
});

document.getElementById('btn-cerrar').addEventListener('click', () => {
  document.getElementById('modal-materia').classList.add('hidden');
});

document.getElementById('btn-guardar-cursando').addEventListener('click', () => {
  guardarEstadoMateria(false);
});

document.getElementById('btn-aprobar').addEventListener('click', () => {
  guardarEstadoMateria(true);
});

document.getElementById('btn-desaprobar').addEventListener('click', () => {
  delete progresoUsuario[materiaSeleccionadaId];
  guardarProgreso();
  document.getElementById('modal-materia').classList.add('hidden');
});

function guardarEstadoMateria(aprobada) {
  const inputsParciales = document.querySelectorAll('.input-nota-parcial');
  const parciales = Array.from(inputsParciales).map(i => i.value).filter(v => v !== '');

  const selectsLab = document.querySelectorAll('.select-lab');
  const laboratorios = Array.from(selectsLab).map(s => s.value);

  const inputsFinales = document.querySelectorAll('.input-nota-final');
  const intentosFinales = Array.from(inputsFinales).map(i => i.value).filter(v => v !== '');

  const numCursada = parseInt(document.getElementById('numero-cursada').value) || 1;
  const condicion = document.getElementById('select-condicion').value;

  let estaAprobada = aprobada;
  let condicionFinal = condicion;

  if (tieneLaboratoriosDesaprobados(laboratorios)) {
    estaAprobada = false;
    condicionFinal = 'libre';
  } else if (condicion === 'promocionado') {
    estaAprobada = true;
  }

  progresoUsuario[materiaSeleccionadaId] = {
    aprobada: estaAprobada,
    parciales: parciales,
    laboratorios: laboratorios,
    intentosFinales: intentosFinales,
    numCursada: numCursada,
    condicion: condicionFinal
  };

  guardarProgreso();
  document.getElementById('modal-materia').classList.add('hidden');
}

renderizarCarrera();