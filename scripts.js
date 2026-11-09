// Catálogo de ejemplo (simula la respuesta del Módulo Catálogo)
const productos = [
  {id:1,nombre:"Nave en órbita",obra:"Calcetines con temática de ciencia ficción",col:"Ciencia Ficción",precio:6990,stock:12,tallas:["S","M","L"],img:"img/calcetin-nave.svg",color:"#cfe0ff"},
  {id:2,nombre:"Alienígena curioso",obra:"Calcetines con temática de ciencia ficción",col:"Ciencia Ficción",precio:7490,stock:3,tallas:["M","L"],img:"img/calcetin-alien.svg",color:"#d6f5d6"},
  {id:3,nombre:"Noche en el pasillo",obra:"Calcetines con temática de terror 80s",col:"Terror 80s",precio:6990,stock:8,tallas:["S","M","L"],img:"img/calcetin-pasillo.svg",color:"#ffd6d1"},
  {id:4,nombre:"Cinta maldita",obra:"Calcetines con temática de terror 80s",col:"Terror 80s",precio:7290,stock:0,tallas:["M"],img:"img/calcetin-cinta.svg",color:"#e3d6f5"},
  {id:5,nombre:"Cena de familia",obra:"Calcetines con temática de series de drama",col:"Series de Drama",precio:6490,stock:15,tallas:["S","M","L"],img:"img/calcetin-cena.svg",color:"#ffe9c2"},
  {id:6,nombre:"Trono de papel",obra:"Calcetines con temática de series de drama",col:"Series de Drama",precio:7990,stock:5,tallas:["M","L"],img:"img/calcetin-trono.svg",color:"#f5ecc2"},
  {id:7,nombre:"Ratón aventurero",obra:"Calcetines con temática de animación",col:"Animación",precio:5990,stock:20,tallas:["S","M"],img:"img/calcetin-raton.svg",color:"#ffe0ee"},
  {id:8,nombre:"Robot cocinero",obra:"Calcetines con temática de animación",col:"Animación",precio:6790,stock:7,tallas:["S","M","L"],img:"img/calcetin-robot.svg",color:"#d1f1f5"}
];
let colecciones = ["Todas", ...new Set(productos.map(p => p.col))];
let filtro = "Todas";
let carrito = []; // [{id, talla, cantidad}]
const $ = id => document.getElementById(id);
const clp = n => "$" + n.toLocaleString("es-CL");
const prod = id => productos.find(p => p.id === id);

function renderFiltros(){
  $("filtros").innerHTML = colecciones.map(c =>
    `<button aria-pressed="${c===filtro}" data-col="${c}">${c}</button>`).join("");
  $("filtros").querySelectorAll("button").forEach(b => b.onclick = () => { filtro = b.dataset.col; renderFiltros(); renderGrid(); });
}

function renderGrid(){
  const lista = productos.filter(p => filtro === "Todas" || p.col === filtro);
  $("grid").innerHTML = lista.map(p => `
    <article class="card">
      <div class="foto" style="background:${p.color}" >
        <img src="${p.img}" alt="Calcetín ${p.nombre}" loading="lazy">
      </div>
      <div class="info">
        <h3>${p.nombre}</h3>
        <p class="obra">${p.obra.startsWith("Calcetines") ? p.obra : "Calcetines con temática de " + p.obra}</p>
        <span class="precio">${clp(p.precio)}</span>
        <span class="stock ${p.stock<=3?"bajo":""}">${p.stock===0?"Sin stock":"Stock: "+p.stock}</span>
        <label>Talla <select id="talla-${p.id}">${p.tallas.map(t=>`<option>${t}</option>`).join("")}</select></label>
        <button class="btn" data-add="${p.id}" ${p.stock===0?"disabled":""}>Agregar al carrito</button>
        ${extra(p)}
      </div>
    </article>`).join("");
  $("grid").querySelectorAll("[data-add]").forEach(b => b.onclick = () => agregar(+b.dataset.add));
  bindExtra();
}

function agregar(id){
  const talla = $("talla-"+id).value;
  const it = carrito.find(i => i.id===id && i.talla===talla);
  if (it) it.cantidad++; else carrito.push({id, talla, cantidad:1});
  renderCarrito();
}

function cambiar(idx, d){
  carrito[idx].cantidad += d;
  if (carrito[idx].cantidad <= 0) carrito.splice(idx,1);
  renderCarrito();
}

const total = () => carrito.reduce((s,i) => s + prod(i.id).precio * i.cantidad, 0);

function renderCarrito(){
  $("items").innerHTML = carrito.length ? carrito.map((i,idx) => `
    <div class="fila"><span>${prod(i.id).nombre} (talla ${i.talla})</span><strong>${clp(prod(i.id).precio*i.cantidad)}</strong>
    <span class="q"><button aria-label="Quitar uno" data-d="-1" data-i="${idx}">−</button>${i.cantidad}<button aria-label="Agregar uno" data-d="1" data-i="${idx}">+</button></span></div>`).join("")
    : "<p>Aún no agregas calcetines.</p>";
  $("items").querySelectorAll("[data-d]").forEach(b => b.onclick = () => cambiar(+b.dataset.i, +b.dataset.d));
  $("total").textContent = clp(total());
}

// Checkout simulado (sigue el diagrama de secuencia de la Vista de Procesos)
function checkout(){
  const r = $("resumen");
  if (!carrito.length){ r.innerHTML = '<div class="msg err">Agrega al menos un producto antes de finalizar la compra.</div>'; return; }
  // 1) verificar stock
  const falta = carrito.find(i => carrito.filter(j => j.id===i.id).reduce((s,j)=>s+j.cantidad,0) > prod(i.id).stock);
  if (falta){ r.innerHTML = `<div class="msg err">No hay stock suficiente de "${prod(falta.id).nombre}". Reduce la cantidad e inténtalo de nuevo.</div>`; return; }
  // 2) simular pago, descontar stock y crear pedido con ID único
  const idPedido = "SB-" + Date.now().toString(36).toUpperCase();
  const detalle = carrito.map(i => `<li>${i.cantidad} × ${prod(i.id).nombre} (${i.talla})</li>`).join("");
  const monto = total();
  carrito.forEach(i => prod(i.id).stock -= i.cantidad);
  carrito = [];
  renderCarrito(); renderGrid();
  r.innerHTML = `<div class="msg"><strong>Pedido confirmado</strong><br>ID: ${idPedido}<ul>${detalle}</ul>Total pagado: ${clp(monto)}</div>`;
}


// ---- RNF02 (simulado): sesión con token tipo JWT ----
let sesion = null; // {nombre, rol, token}
const esc = t => String(t).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const estrellas = n => "★".repeat(n) + "☆".repeat(5-n);
const esAdmin = () => sesion && sesion.rol === "Administrador";

function renderSesion(){
  const s = $("sesion");
  if (!sesion){
    s.innerHTML = `<strong>Acceso</strong><input id="u-nombre" placeholder="Tu nombre" aria-label="Nombre"><select id="u-rol" aria-label="Rol"><option>Cliente</option><option>Administrador</option></select><button class="btn" id="u-in">Ingresar</button><small>Simulación: genera un token JWT de ejemplo (RNF02).</small>`;
    $("u-in").onclick = () => { sesion = {nombre: $("u-nombre").value.trim() || "Invitado", rol: $("u-rol").value, token: "eyJ" + Math.random().toString(36).slice(2,14) + "…"}; renderSesion(); renderGrid(); };
    return;
  }
  let h = `<strong>${esc(sesion.nombre)}</strong> (${sesion.rol}) <small>Token: ${sesion.token}</small><button class="btn sec" id="u-out">Salir</button>`;
  if (esAdmin()) h += `<div class="adm-form"><strong>Nuevo modelo (RF03)</strong><input id="n-nombre" placeholder="Nombre"><input id="n-obra" placeholder="Película/serie"><input id="n-col" list="cols" placeholder="Colección"><datalist id="cols">${colecciones.slice(1).map(c=>`<option>${c}</option>`).join("")}</datalist><input id="n-precio" type="number" placeholder="Precio"><input id="n-stock" type="number" placeholder="Stock"><input id="n-tallas" placeholder="Tallas (S,M,L)"><button class="btn" id="n-add">Registrar</button></div>`;
  s.innerHTML = h;
  $("u-out").onclick = () => { sesion = null; renderSesion(); renderGrid(); };
  if (esAdmin()) $("n-add").onclick = () => {
    const nombre = $("n-nombre").value.trim(), col = $("n-col").value.trim();
    if (!nombre || !col) return;
    productos.push({id: Math.max(...productos.map(p=>p.id)) + 1, nombre, obra: $("n-obra").value.trim() || col, col, precio: Math.max(0,+$("n-precio").value||0), stock: Math.max(0,+$("n-stock").value||0), tallas: ($("n-tallas").value||"M").split(",").map(t=>t.trim()).filter(Boolean), img:"img/calcetin-generico.svg", color:"#e8e8f5"});
    colecciones = ["Todas", ...new Set(productos.map(p => p.col))];
    renderSesion(); renderFiltros(); renderGrid();
  };
}

// ---- RF04 reseñas y RF03 administración ----
const resenas = {1:[{n:"Camila",e:5,c:"Diseño genial y muy abrigados."}], 5:[{n:"Diego",e:4,c:"Buena calidad."}]};
function extra(p){
  const rs = resenas[p.id] || [];
  const prom = rs.length ? (rs.reduce((s,r)=>s+r.e,0)/rs.length).toFixed(1) : "–";
  let h = `<div class="rev"><strong>Reseñas (${prom} ★ · ${rs.length})</strong>${rs.slice(-2).map(r=>`<p><span aria-label="${r.e} estrellas">${estrellas(r.e)}</span> ${esc(r.n)}: ${esc(r.c)}</p>`).join("")}`;
  h += sesion ? `<select id="e-${p.id}" aria-label="Estrellas">${[5,4,3,2,1].map(n=>`<option>${n}</option>`).join("")}</select><input id="c-${p.id}" placeholder="Tu comentario" aria-label="Comentario"><button class="btn sec" data-rev="${p.id}">Publicar reseña</button>` : `<small>Ingresa para publicar una reseña.</small>`;
  h += `</div>`;
  if (esAdmin()) h += `<div class="rev"><strong>Administrar</strong><label>Precio <input type="number" id="p-${p.id}" value="${p.precio}"></label><label>Stock <input type="number" id="s-${p.id}" value="${p.stock}"></label><button class="btn sec" data-adm="${p.id}">Guardar</button></div>`;
  return h;
}
function bindExtra(){
  document.querySelectorAll("[data-rev]").forEach(b => b.onclick = () => {
    const id = +b.dataset.rev, c = $("c-"+id).value.trim(); if (!c) return;
    (resenas[id] = resenas[id] || []).push({n: sesion.nombre, e: +$("e-"+id).value, c}); renderGrid();
  });
  document.querySelectorAll("[data-adm]").forEach(b => b.onclick = () => {
    const p = prod(+b.dataset.adm); p.precio = Math.max(0,+$("p-"+p.id).value); p.stock = Math.max(0,+$("s-"+p.id).value); renderGrid(); renderCarrito();
  });
}

// Inicio (al final, cuando todo ya está declarado)
renderSesion(); renderFiltros(); renderGrid(); renderCarrito();
$("btn-checkout").onclick = checkout;
