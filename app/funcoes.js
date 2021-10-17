//importar configuracoes globais
import * as conf from "../config/config.js";
import * as dom from "../config/elem_dom.js";

var lista_final = {};
dom.d_card_pais.style.display = "none";
dom.d_erro.style.display = "none";
dom.d_sel_paises.style.display = "none";
dom.d_carregando_t.style.display = "none";
dom.bx_csv.style.display = "none";

//Busca da API
export async function chamarApi(api) {
  try {
    const res = await fetch(api);
    var lista = await res.json();
    if (res) {
      certCarregamento();
    }
    listarPaises(lista);
    lista_final = lista;
    jsonParaCsv(lista_final);
  } catch (error) {
    reportarErro();
    console.log("Ocorreu o erro => " + error);
    throw Error(res.statusText);
  }
}
//Confirmar resposta
function certCarregamento() {
  dom.d_carregando.style.display = "none";
  dom.d_carregando_t.style.display = "none";
  dom.d_sel_paises.style.display = "";
  dom.bx_csv.style.display = "";
}
function reportarErro() {
  dom.d_painel.style.display = "none";
  dom.d_erro.style.display = "";
}

//Accionar a busca da API
export function efectuarBusca() {
  chamarApi(conf.URL_API);
}

// Listar os Paises
function listarPaises(lista) {
  var paises_sorteados = [];
  for (var pais of lista) {
    paises_sorteados.push(pais.name.common);
  }
  paises_sorteados.sort();
  for (var p of paises_sorteados) {
    const opcao = document.createElement("option");
    opcao.textContent = p;
    dom.d_sel_paises.appendChild(opcao);
  }
}

//Evento para o Pais seleccionado
const s = document.getElementById("selec_paises");
s.addEventListener(
  "change",
  (e) => {
    var pais_esc = e.target.options[e.target.selectedIndex].text;
    mostrarInfo(pais_esc);
  },
  false
);

//Mostrar Info do Pais
function mostrarInfo(paisesc) {
  dom.d_card_pais.style.display = "";
  for (var sp of lista_final) {
    if (sp.name.common == paisesc) {
      dom.d_bandeira.src = sp.flags.png;
      dom.d_nome.innerHTML = sp.translations.por.common;
      dom.d_nomeoficial.innerHTML = sp.translations.por.official;
      dom.d_capital.innerHTML = sp.capital[0];
      dom.d_regiao.innerHTML = sp.region;
      dom.d_subregiao.innerHTML = sp.subregion;
      dom.d_populacao.innerHTML = sp.population;
      dom.d_area.innerHTML = sp.area;
      dom.d_fusohorario.innerHTML = sp.timezones;
    }
  }
}

//JsonParaCSV
function jsonParaCsv(lista_rec) {
  var m_json = [];
  for (var sp of lista_rec) {
    m_json = [
      ...m_json,
      {
        "Nome": sp.translations.por.common,
        "Nome Oficial": sp.translations.por.official,
        "Capital": sp.capital,
        "Região": sp.region,
        "Sub-Região": sp.subregion,
        "População": sp.population,
        "Area": sp.area,
        "Fuso horário": sp.timezones,
      },
    ];
  }

  const chaves = Object.keys(m_json[0]);
  const conS =
    "\uFEFF" +
    [
      chaves.join(","),
      m_json.map((r) => chaves.map((chave) => r[chave]).join(",")).join("\n"),
    ].join("\n");
  const csvBlob = new Blob([conS], { type: "text/csv;charset=utf-8" });
  conf.bx_csv.href = URL.createObjectURL(csvBlob);
}
