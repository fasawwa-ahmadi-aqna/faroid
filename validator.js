/**
 * Validator jawaban faraid.
 * Memakai Fraction.js (global `Fraction`) dari CDN.
 */

/**
 * Parse input user menjadi Fraction.
 * "1/2" -> 1/2; "2/4" -> 1/2; "0.5" -> 1/2; "sisa"/"" -> null; "0" -> 0.
 */
function parsePecahan(input) {
  const s = String(input ?? "").trim().toLowerCase();
  if (s === "sisa" || s === "") return null;

  if (/^-?\d*\.?\d+$/.test(s)) {
    return new Fraction(parseFloat(s));
  }

  const m = s.match(/^(-?\d+)\s*\/\s*(-?\d+)$/);
  if (m) {
    const pembilang = parseInt(m[1], 10);
    const penyebut = parseInt(m[2], 10);
    if (penyebut === 0) return null;
    return new Fraction(pembilang, penyebut);
  }

  return null;
}

/**
 * Hitung sisa = 1 - jumlah semua pecahan (selain "sisa"/"0").
 * Kembalikan Fraction atau null jika ambigu.
 */
function hitungSisaDariKunci(kunci) {
  let total = new Fraction(0);
  let adaSisa = false;

  for (const item of kunci.bagian) {
    const p = String(item.pecahan).toLowerCase().trim();
    if (p === "sisa") {
      if (adaSisa) return null;
      adaSisa = true;
      continue;
    }
    if (p === "0") continue;

    const frac = parsePecahan(item.pecahan);
    if (!frac) return null;
    total = total.add(frac);
  }

  return new Fraction(1).sub(total);
}

/**
 * Validasi jawaban user terhadap kunci.
 * @param {Object} jawabanUser - { jenis: "1/2" | "sisa" | "0" | ... }
 * @param {Object} kunci        - { asalMasalah, status, bagian: [...] }
 * @returns {Object} { valid, detail: [...], skorPersen }
 */
function validasiJawaban(jawabanUser, kunci) {
  const detail = [];
  let jumlahCocok = 0;
  const jumlahTotal = kunci.bagian.length;

  for (const item of kunci.bagian) {
    const inputUser = jawabanUser[item.jenis] ?? "";
    const kunciPecahan = String(item.pecahan).toLowerCase().trim();
    let cocok = false;
    let pesan;

    if (kunciPecahan === "sisa") {
      const sisa = hitungSisaDariKunci(kunci);
      const parsed = parsePecahan(inputUser);
      if (String(inputUser).toLowerCase().trim() === "sisa") {
        cocok = true;
      } else if (sisa && parsed && parsed.equals(sisa)) {
        cocok = true;
      } else {
        pesan = "Jawaban 'sisa' tidak cocok. Cek perhitungan sisa.";
      }
    } else if (kunciPecahan === "0") {
      const parsed = parsePecahan(inputUser);
      if ((parsed && parsed.equals(0)) || String(inputUser).trim() === "" || String(inputUser).trim() === "0") {
        cocok = true;
      } else {
        pesan = "Ahli waris ini terhijab, seharusnya 0.";
      }
    } else {
      const kunciFrac = parsePecahan(item.pecahan);
      const userFrac = parsePecahan(inputUser);

      if (!userFrac) {
        pesan = "Format pecahan tidak valid (mis. 1/2, 0.5, sisa, 0).";
      } else if (!kunciFrac) {
        pesan = "Kunci jawaban tidak valid (bug internal).";
      } else if (userFrac.equals(kunciFrac)) {
        cocok = true;
      } else {
        pesan = `Salah. Kunci: ${item.pecahan}`;
      }
    }

    if (cocok) jumlahCocok++;

    detail.push({
      jenis: item.jenis,
      jawabanUser: inputUser,
      kunci: item.pecahan,
      cocok,
      pesan,
    });
  }

  const skorPersen = jumlahTotal === 0 ? 0 : Math.round((jumlahCocok / jumlahTotal) * 100);

  return { valid: jumlahCocok === jumlahTotal, detail, skorPersen };
}
