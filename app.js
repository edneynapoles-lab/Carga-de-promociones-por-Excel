let data = [];

const fileInput = document.getElementById("file");
const previewDiv = document.getElementById("preview");

fileInput.addEventListener("change", async (e)=>{
  const file = e.target.files[0];
  if(!file) return;

  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer);

  const sheet = wb.Sheets[wb.SheetNames[0]];

  data = XLSX.utils.sheet_to_json(sheet);

  console.log("DATA:", data);
});

document.getElementById("btnPreview").addEventListener("click", ()=>{

  if(!data.length){
    alert("Carga archivo primero");
    return;
  }

  previewDiv.innerHTML = "";

	const keyNumero = findKey(data, ["n°","numero","nro"]);
	const keyEAN = findKey(data, ["codigo producto","ean","codigo"]);
	const keyTipo = findKey(data, ["tipo de descuento","tipo"]);
	const keyPrecio = findKey(data, ["pvp oferta pack","precio"]);
	const keyPct = findKey(data, ["descuento porcentual","porcentaje","%"]);

  if(!keyNumero || !keyEAN){
    alert("Columnas no detectadas");
    return;
  }

  const grupos = {};

  data.forEach(row=>{
    const num = row[keyNumero];
    if(!num) return;

    if(!grupos[num]) grupos[num] = [];
    grupos[num].push(row);
  });

  Object.entries(grupos).forEach(([numero, rows])=>{

    const tipo = (rows[0][keyTipo] || "").toUpperCase();

    const eans = rows.map(r => r[keyEAN]);

    const card = document.createElement("div");
    card.className = "card";

    let extra = "";

    if(tipo.includes("NOMINAL")){
      extra = `<div><b>Precio:</b> ${rows[0][keyPrecio]}</div>`;
    }

    if(tipo.includes("PORCENTUAL")){
      extra = `<div><b>%:</b> ${rows[0][keyPct]}</div>`;
    }

    card.innerHTML = `
      <div class="title">
        Promo N° ${numero} 
        <span class="tag">${tipo}</span>
      </div>

      <div><b>EANS:</b> ${eans.slice(0,5).join(", ")}</div>

      ${extra}
    `;

    previewDiv.appendChild(card);
  });

});


function normalize(text){
  return text?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
}

function findKey(data, posibles){
  const keys = Object.keys(data[0]);

  console.log("HEADERS DETECTADOS:", keys); // 👈 DEBUG

  const normalize = (t)=>
    t?.toLowerCase()
     .normalize("NFD")
     .replace(/[\u0300-\u036f]/g,"")
     .replace(/[^a-z0-9]/g,"");

  for(let p of posibles){
    const np = normalize(p);

    const match = keys.find(k=>{
      const nk = normalize(k);
      return nk.includes(np);
    });

    if(match){
      console.log("MATCH:", p, "→", match);
      return match;
    }
  }

  return null;
}