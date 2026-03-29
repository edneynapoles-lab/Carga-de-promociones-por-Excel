const fileOrigen = document.getElementById('fileOrigen');
const btnPreview = document.getElementById('btnPreview');

let data = null;

fileOrigen.addEventListener('change', async (e)=>{
  const file = e.target.files[0];
  if(!file) return;

  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer);

  const sheet = wb.Sheets[wb.SheetNames[0]];
  data = XLSX.utils.sheet_to_json(sheet);

  console.log("DATA:", data);
});

btnPreview.addEventListener('click', runPreview);

function runPreview(){
  console.log("CLICK PREVIEW");

  if(!data){
    alert("Carga archivo primero");
    return;
  }

  let html = '';

  data.slice(0,5).forEach((row,i)=>{
    html += `
      <div style="border:1px solid #ccc; margin:10px; padding:10px;">
        <b>Fila ${i+1}</b><br>
        ${JSON.stringify(row)}
      </div>
    `;
  });

  openPreview(html);
}

function openPreview(html){
  document.getElementById('previewContent').innerHTML = html;
  document.getElementById('previewModal').style.display = 'block';
}

function closePreview(){
  document.getElementById('previewModal').style.display = 'none';
}