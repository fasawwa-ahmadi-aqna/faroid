/**
 * Logika UI halaman latihan faraid.
 * Bergantung pada: Fraction (CDN), validasiJawaban, generateSoal, BANK_SOAL, hitungFaraid.
 */

// ============ LABEL AHLI WARIS ============
const LABEL_AHLI_WARIS = {
  suami: "Suami",
  istri: "Istri",
  ayah: "Ayah",
  ibu: "Ibu",
  kakek: "Kakek",
  nenek: "Nenek",
  nenekIbu: "Nenek (dari ibu)",
  nenekAyah: "Nenek (dari ayah)",
  anakL: "Anak Laki-laki",
  anakP: "Anak Perempuan",
  cucuL: "Cucu Laki-laki",
  cucuP: "Cucu Perempuan",
  saudaraLK: "Saudara Laki-laki Kandung",
  saudaraPK: "Saudara Perempuan Kandung",
  saudaraSeayahL: "Saudara Laki-laki Seayah",
  saudaraSeayahP: "Saudara Perempuan Seayah",
  saudaraSeibu: "Saudara Seibu",
  paman: "Paman",
  keponakan: "Keponakan",
};

function labelJenis(jenis) {
  return LABEL_AHLI_WARIS[jenis] || jenis;
}

function formatRupiah(n) {
  return "Rp " + Math.round(n).toLocaleString("id-ID");
}

// ============ STATE ============
let soalAktif = null;
let indeksBank = -1;

// ============ ELEMEN ============
const el = (id) => document.getElementById(id);

const sumberSelect = el("sumber");
const templateSelect = el("template");
const wrapTemplate = el("wrapTemplate");
const btnMuat = el("btnMuat");

const panelSoal = el("panelSoal");
const badgeId = el("badgeId");
const badgeKategori = el("badgeKategori");
const judulSoal = el("judulSoal");
const pertanyaanSoal = el("pertanyaanSoal");
const nilaiHarta = el("nilaiHarta");
const daftarAhliWaris = el("daftarAhliWaris");

const formJawaban = el("formJawaban");
const inputAhliWaris = el("inputAhliWaris");
const btnPembahasan = el("btnPembahasan");

const hasilValidasi = el("hasilValidasi");
const pembahasanBox = el("pembahasan");
const daftarPembahasan = el("daftarPembahasan");

// ============ EVENT LATIHAN ============
sumberSelect.addEventListener("change", () => {
  wrapTemplate.style.display = sumberSelect.value === "gen" ? "" : "none";
});

btnMuat.addEventListener("click", muatSoal);
formJawaban.addEventListener("submit", (e) => {
  e.preventDefault();
  cekJawaban();
});
btnPembahasan.addEventListener("click", tampilkanPembahasan);

// ============ MUAT SOAL ============
function muatSoal() {
  const sumber = sumberSelect.value;

  if (sumber === "bank") {
    indeksBank = (indeksBank + 1) % BANK_SOAL.soal.length;
    soalAktif = BANK_SOAL.soal[indeksBank];
  } else {
    soalAktif = generateSoal({
      templateKode: templateSelect.value || undefined,
      hartaMin: 24_000_000,
      hartaMax: 360_000_000,
    });
  }

  renderSoal(soalAktif);
}

function renderSoal(soal) {
  panelSoal.hidden = false;
  hasilValidasi.hidden = true;
  pembahasanBox.hidden = true;

  badgeId.textContent = soal.id;
  badgeKategori.textContent = (soal.kategori || []).join(" · ");
  judulSoal.textContent = soal.judul;
  pertanyaanSoal.textContent = soal.pertanyaan;

  nilaiHarta.textContent = formatRupiah(soal.kasus.harta);

  daftarAhliWaris.innerHTML = soal.kasus.ahliWaris
    .map((a) => `${labelJenis(a.jenis)} (${a.jumlah})`)
    .join(", ");

  inputAhliWaris.innerHTML = "";
  for (const aw of soal.kasus.ahliWaris) {
    const div = document.createElement("div");
    div.className = "input-item";

    const label = document.createElement("label");
    label.textContent =
      labelJenis(aw.jenis) + (aw.jumlah > 1 ? ` (${aw.jumlah} orang)` : "");
    label.setAttribute("for", `input-${aw.jenis}`);

    const input = document.createElement("input");
    input.type = "text";
    input.id = `input-${aw.jenis}`;
    input.name = aw.jenis;
    input.placeholder = "mis. 1/2";
    input.autocomplete = "off";

    const small = document.createElement("small");
    small.textContent = "Pecahan / 'sisa' / 0";

    div.appendChild(label);
    div.appendChild(input);
    div.appendChild(small);
    inputAhliWaris.appendChild(div);
  }

  const first = inputAhliWaris.querySelector("input");
  if (first) first.focus();
}

// ============ CEK JAWABAN ============
function cekJawaban() {
  if (!soalAktif) return;

  const jawabanUser = {};
  for (const aw of soalAktif.kasus.ahliWaris) {
    const input = el(`input-${aw.jenis}`);
    jawabanUser[aw.jenis] = input ? input.value.trim() : "";
  }

  const hasil = validasiJawaban(jawabanUser, soalAktif.jawaban);
  renderHasil(hasil);
}

function renderHasil(hasil) {
  hasilValidasi.hidden = false;

  const skorClass = hasil.valid ? "status-ok" : "status-no";
  let html = `<div class="hasil skor ${skorClass}">
    Skor: ${hasil.skorPersen}% ${hasil.valid ? "✅ Semua benar!" : "❌ Belum tepat"}
  </div>`;

  for (const d of hasil.detail) {
    const status = d.cocok
      ? '<span class="status-ok">✔</span>'
      : '<span class="status-no">✘</span>';
    const pesan = d.pesan ? `<span class="pesan">${d.pesan}</span>` : "";
    html += `<div class="hasil-item">
      <span>${status} <strong>${labelJenis(d.jenis)}</strong></span>
      <span>Jawabanmu: <code>${d.jawabanUser || "—"}</code> | Kunci: <code>${d.kunci}</code></span>
      ${pesan}
    </div>`;
  }

  hasilValidasi.innerHTML = html;

  if (hasil.valid) tampilkanPembahasan();
}

// ============ PEMBAHASAN ============
function tampilkanPembahasan() {
  if (!soalAktif) return;
  pembahasanBox.hidden = false;
  daftarPembahasan.innerHTML = "";

  for (const langkah of soalAktif.pembahasan) {
    const li = document.createElement("li");
    li.textContent = langkah;
    daftarPembahasan.appendChild(li);
  }

  const ringkasan = document.createElement("div");
  ringkasan.style.marginTop = "1rem";
  ringkasan.innerHTML =
    `<strong>Kunci:</strong> Asal masalah ${soalAktif.jawaban.asalMasalah} ` +
    `(status: ${soalAktif.jawaban.status}).<br>` +
    soalAktif.jawaban.bagian
      .map(
        (b) =>
          `${labelJenis(b.jenis)}: ${b.pecahan}` +
          (b.nominal ? ` ≈ ${formatRupiah(b.nominal)}` : "")
      )
      .join(" · ");
  pembahasanBox.appendChild(ringkasan);

  pembahasanBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// ============ KALKULATOR BEBAS ============
const DAFTAR_JENIS_KALK = [
  { jenis: "suami", label: "Suami", max: 1 },
  { jenis: "istri", label: "Istri", max: 4 },
  { jenis: "anakL", label: "Anak Laki-laki", max: 10 },
  { jenis: "anakP", label: "Anak Perempuan", max: 10 },
  { jenis: "cucuL", label: "Cucu Laki-laki (dari anak lk)", max: 10 },
  { jenis: "cucuP", label: "Cucu Perempuan (dari anak lk)", max: 10 },
  { jenis: "ayah", label: "Ayah", max: 1 },
  { jenis: "ibu", label: "Ibu", max: 1 },
  { jenis: "kakek", label: "Kakek (dari ayah)", max: 1 },
  { jenis: "nenekIbu", label: "Nenek (dari ibu)", max: 1 },
  { jenis: "nenekAyah", label: "Nenek (dari ayah)", max: 1 },
  { jenis: "saudaraLK", label: "Saudara Laki-laki Kandung", max: 10 },
  { jenis: "saudaraPK", label: "Saudara Perempuan Kandung", max: 10 },
  { jenis: "saudaraSeayahL", label: "Saudara Laki-laki Seayah", max: 10 },
  { jenis: "saudaraSeayahP", label: "Saudara Perempuan Seayah", max: 10 },
  { jenis: "saudaraSeibu", label: "Saudara Seibu (lk/pr)", max: 10 },
];

const daftarAhliWarisKalk = el("daftarAhliWarisKalk");
const inputHarta = el("inputHarta");
const btnHitung = el("btnHitung");
const hasilKalkulator = el("hasilKalkulator");

function renderKalkulatorInput() {
  daftarAhliWarisKalk.innerHTML = "";
  for (const item of DAFTAR_JENIS_KALK) {
    const div = document.createElement("div");
    div.className = "kalk-item";

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.id = `kalk-cb-${item.jenis}`;
    cb.dataset.jenis = item.jenis;

    const label = document.createElement("label");
    label.htmlFor = cb.id;
    label.textContent = item.label;

    const num = document.createElement("input");
    num.type = "number";
    num.min = 1;
    num.max = item.max;
    num.value = 1;
    num.id = `kalk-num-${item.jenis}`;
    num.disabled = true;

    cb.addEventListener("change", () => {
      num.disabled = !cb.checked;
    });

    div.appendChild(cb);
    div.appendChild(label);
    div.appendChild(num);
    daftarAhliWarisKalk.appendChild(div);
  }
}

function ambilAhliWarisKalk() {
  const hasil = [];
  for (const item of DAFTAR_JENIS_KALK) {
    const cb = el(`kalk-cb-${item.jenis}`);
    const num = el(`kalk-num-${item.jenis}`);
    if (cb && cb.checked) {
      const jumlah = Math.max(1, parseInt(num.value, 10) || 1);
      hasil.push({ jenis: item.jenis, jumlah });
    }
  }
  return hasil;
}

// Render hasil kalkulator — parameter `harta` dihapus (tidak dipakai)
function renderHasilKalkulator(hasil) {
  hasilKalkulator.hidden = false;

  if (hasil.status === "perlu-konsultasi") {
    let html = `<div class="peringatan" style="font-size:1rem; padding:1rem;">
      <strong>⚠️ Kasus Memerlukan Penanganan Khusus</strong>
    </div>`;
    html += `<ol class="langkah-list" style="margin-top:1rem;">`;
    for (const l of hasil.langkah) {
      html += `<li>${l}</li>`;
    }
    html += `</ol>`;
    hasilKalkulator.innerHTML = html;
    return;
  }

  if (hasil.bagian.length === 0) {
    // Tampilkan langkah + peringatan (jika ada)
    let html = `<p>${hasil.langkah.join("<br>")}</p>`;
    if (hasil.peringatan && hasil.peringatan.length > 0) {
      html += `<div class="peringatan">⚠️ ${hasil.peringatan.join("<br>⚠️ ")}</div>`;
    }
    hasilKalkulator.innerHTML = html;
    return;
  }

  let html = `<h3>Hasil Pembagian</h3>`;
  html += `<table class="hasil-tabel">
    <thead>
      <tr>
        <th>Ahli Waris</th>
        <th class="num">Jumlah</th>
        <th class="num">Pecahan</th>
        <th class="num">Nominal</th>
        <th class="num">Per Orang</th>
      </tr>
    </thead>
    <tbody>`;

  for (const b of hasil.bagian) {
    html += `<tr>
      <td>${labelJenis(b.jenis)}</td>
      <td class="num">${b.jumlah}</td>
      <td class="num"><code>${b.pecahan}</code></td>
      <td class="num">${formatRupiah(b.nominal)}</td>
      <td class="num">${formatRupiah(b.perOrang)}</td>
    </tr>`;
  }
  html += `</tbody></table>`;

  html += `<p><strong>Asal masalah:</strong> ${hasil.asalMasalah} · <strong>Status:</strong> ${hasil.status}`;
  if (hasil.keBaitulMal > 0) {
    html += ` · <strong>Sisa ke baitul mal:</strong> ${formatRupiah(hasil.keBaitulMal)}`;
  }
  html += `</p>`;

  if (hasil.peringatan && hasil.peringatan.length > 0) {
    html += `<div class="peringatan">⚠️ ${hasil.peringatan.join("<br>⚠️ ")}</div>`;
  }

  html += `<h3>Langkah Perhitungan</h3>`;
  html += `<ol class="langkah-list">`;
  for (const l of hasil.langkah) {
    html += `<li>${l}</li>`;
  }
  html += `</ol>`;

  hasilKalkulator.innerHTML = html;
}

btnHitung.addEventListener("click", () => {
  // Hapus semua non-digit — aman untuk format "120.000.000" maupun "120000000"
  const harta = parseFloat(String(inputHarta.value).replace(/[^\d]/g, "")) || 0;
  if (harta <= 0) {
    alert("Masukkan total harta yang valid.");
    return;
  }

  const daftar = ambilAhliWarisKalk();
  if (daftar.length === 0) {
    alert("Pilih minimal satu ahli waris.");
    return;
  }

  const hasil = hitungFaraid(harta, daftar);
  renderHasilKalkulator(hasil);
});

// ============ NAVIGASI MATERI / LATIHAN ============
const panelMateri = el("panelMateri");
const panelLatihan = el("panelLatihan");
const btnKeLatihan = el("btnKeLatihan");

function tampilkanTab(tab) {
  if (tab === "materi") {
    panelMateri.hidden = false;
    panelLatihan.hidden = true;
    document.querySelectorAll(".btn-tab").forEach((b) => {
      b.classList.toggle("active", b.dataset.tab === "materi");
    });
  } else {
    panelMateri.hidden = true;
    panelLatihan.hidden = false;
    document.querySelectorAll(".btn-tab").forEach((b) => {
      b.classList.toggle("active", b.dataset.tab === "latihan");
    });
    // Muat soal pertama saat pertama kali masuk tab latihan
    if (!soalAktif) muatSoal();
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll(".btn-tab").forEach((btn) => {
  btn.addEventListener("click", () => tampilkanTab(btn.dataset.tab));
});

if (btnKeLatihan) {
  btnKeLatihan.addEventListener("click", () => tampilkanTab("latihan"));
}

window.addEventListener("load", () => {
  const splash = document.getElementById("splash-screen");
  if (splash) {
    // Beri jeda sedikit (misal 800ms) agar animasi terlihat, lalu hilangkan
    setTimeout(() => {
      splash.classList.add("hidden");
    }, 4900);
  }
});

// ============ INIT ============
// Render input kalkulator (aman dipanggil kapan saja setelah DOM siap)
renderKalkulatorInput();
// Tampilkan materi terlebih dahulu; soal dimuat saat masuk tab latihan
tampilkanTab("materi");

