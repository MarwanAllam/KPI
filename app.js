const form=document.getElementById('dailyForm');
const dash=document.getElementById('dashboard');
let data=JSON.parse(localStorage.getItem('kpi_data')||'[]');

function render(){
  let totals={gas:0,oc_exist:0,oc_new:0,points:0,postpaid:0,adsl:0,wireless:0,devices:0};
  data.forEach(d=>{Object.keys(totals).forEach(k=>totals[k]+=Number(d[k]||0));});
  dash.innerHTML = `<pre>${JSON.stringify(totals,null,2)}</pre>`;
}

form.addEventListener('submit',e=>{
  e.preventDefault();
  const entry={
    date:date.value,
    gas:gas.value,
    oc_exist:oc_exist.value,
    oc_new:oc_new.value,
    points:points.value,
    postpaid:postpaid.value,
    adsl:adsl.value,
    wireless:wireless.value,
    devices:devices.value
  };
  data.push(entry);
  localStorage.setItem('kpi_data',JSON.stringify(data));
  render();
  form.reset();
});

render();

// PWA service worker
if('serviceWorker' in navigator){navigator.serviceWorker.register('service-worker.js');}
