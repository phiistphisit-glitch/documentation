// ============================================
// PACKAGING CALCULATOR V2 - Fixed Cost + Optional Features
// ============================================

function createPackagingCalculatorV2() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const oldSheet = ss.getSheetByName('บรรจุภัณฑ์ยืดหยุ่น');
  if (oldSheet) ss.deleteSheet(oldSheet);

  const sheet = ss.insertSheet('บรรจุภัณฑ์ยืดหยุ่น');

  sheet.setColumnWidth(1, 280);
  sheet.setColumnWidth(2, 120);
  sheet.setColumnWidth(3, 120);
  sheet.setColumnWidth(4, 100);

  // === HEADER ===
  sheet
    .getRange('A1:D1')
    .merge()
    .setValue('🧮 เครื่องคำนวณบรรจุภัณฑ์ยืดหยุ่น (Full Features)')
    .setFontSize(18)
    .setFontWeight('bold')
    .setBackground('#667eea')
    .setFontColor('#ffffff')
    .setHorizontalAlignment('center');

  let row = 3;

  // === BASIC INPUTS ===
  sheet
    .getRange(`A${row}:D${row}`)
    .merge()
    .setValue('📝 ข้อมูลพื้นฐาน')
    .setFontSize(14)
    .setFontWeight('bold')
    .setBackground('#e8eaf6');

  row++;
  const basicInputs = [
    ['จำนวนซอง (pcs)', 100000, '', 'qty'],
    ['กว้างซอง (mm)', 100, '', 'width'],
    ['สูงซอง (mm)', 120, '', 'height'],
    ['หน้าม้วน (web) กว้าง (mm)', 1000, '', 'webWidth'],
    ['จำนวนสีพิมพ์', 6, '', 'colors'],
    ['Ink ใช้ต่อ 1 ตร.ม. ต่อสี (g)', 4, '', 'inkPerSqm'],
    ['กาวใช้ต่อ 1 ตร.ม. (g)', 3, '', 'gluePerSqm'],
    ['ตั้งเสียพิมพ์ (m)', 5000, '', 'printWaste'],
    ['ตั้งเสียเคลือบ/อื่นๆ (m)', 3000, '', 'coatWaste'],
    ['ราคา/กล้ามหมึก (฿)', 160, '', 'inkPrice'],
    ['ขนาดต่อกล้าม (kg)', 4, '', 'canSize'],
    ['ราคากาว (฿/กก.)', 160, '', 'gluePrice'],
    ['กำไรสุทธิ (%)', 15, '', 'profit'],
  ];

  basicInputs.forEach(([label, value, _, name]) => {
    sheet.getRange(`A${row}`).setValue(label).setFontWeight('bold');
    sheet.getRange(`B${row}`).setValue(value).setNumberFormat('#,##0.00');
    sheet.getRange(`D${row}`).setValue(name).setFontColor('#999999').setFontSize(9);
    row++;
  });

  // === OPTIONAL FEATURES ===
  row++;
  sheet
    .getRange(`A${row}:D${row}`)
    .merge()
    .setValue('⚙️ คุณสมบัติเสริม (Optional Features)')
    .setFontSize(14)
    .setFontWeight('bold')
    .setBackground('#fff3e0');

  row++;
  sheet
    .getRange(`A${row}:D${row}`)
    .setValues([['รายการ', 'ใช้งาน (Y/N)', 'ค่าใช้จ่าย', 'หมายเหตุ']])
    .setFontWeight('bold')
    .setBackground('#f5f5f5');

  row++;
  const optionsStart = row;

  // ปั๊มนูน/บอด
  sheet.getRange(`A${row}`).setValue('1. ปั๊มนูน/บอด (Embossing)');
  sheet
    .getRange(`B${row}`)
    .setValue('N')
    .setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['Y', 'N']).build());
  sheet.getRange(`C${row}`).setFormula(`=IF(B${row}="Y",calculateEmbossCost(qty),0)`).setNumberFormat('#,##0.00');
  sheet.getRange(`D${row}`).setValue('useEmb').setFontColor('#999999').setFontSize(9);
  row++;

  sheet
    .getRange(`A${row}:D${row}`)
    .merge()
    .setValue('   → ขั้นต่ำ: 2,500฿ | >10k ใบ: 3฿/ใบ')
    .setFontSize(10)
    .setFontColor('#666');
  row++;

  // ปั๊มทอง
  sheet.getRange(`A${row}`).setValue('2. ปั๊มทอง (Hot Stamping)');
  sheet
    .getRange(`B${row}`)
    .setValue('N')
    .setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['Y', 'N']).build());
  sheet
    .getRange(`C${row}`)
    .setFormula(`=IF(B${row}="Y",calculateStampCost(qty,foilArea),0)`)
    .setNumberFormat('#,##0.00');
  sheet.getRange(`D${row}`).setValue('useStamp').setFontColor('#999999').setFontSize(9);
  row++;

  sheet.getRange(`A${row}`).setValue('   → พื้นที่ปั๊มต่อใบ (cm²)').setFontColor('#666');
  sheet.getRange(`B${row}`).setValue(10).setNumberFormat('#,##0.00');
  sheet.getRange(`D${row}`).setValue('foilArea').setFontColor('#999999').setFontSize(9);
  row++;

  sheet.getRange(`A${row}`).setValue('   → ราคาฟอยล์ทอง/ม้วน (฿)').setFontColor('#666');
  sheet.getRange(`B${row}`).setValue(800).setNumberFormat('#,##0.00');
  sheet.getRange(`D${row}`).setValue('foilPrice').setFontColor('#999999').setFontSize(9);
  row++;

  sheet.getRange(`A${row}`).setValue('   → ขนาดม้วน (m)').setFontColor('#666');
  sheet.getRange(`B${row}`).setValue(100).setNumberFormat('#,##0.00');
  sheet.getRange(`D${row}`).setValue('foilRollSize').setFontColor('#999999').setFontSize(9);
  row++;

  sheet
    .getRange(`A${row}:D${row}`)
    .merge()
    .setValue('   → ค่าแรง: 0.5฿/ใบ | ตั้งเครื่อง: 3k-10k ตามปริมาณ')
    .setFontSize(10)
    .setFontColor('#666');
  row++;

  // สปอต์ UV
  sheet.getRange(`A${row}`).setValue('3. สปอต์ UV (Spot UV)');
  sheet
    .getRange(`B${row}`)
    .setValue('N')
    .setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['Y', 'N']).build());
  sheet.getRange(`C${row}`).setFormula(`=IF(B${row}="Y",calculateSpotUVCost(qty),0)`).setNumberFormat('#,##0.00');
  sheet.getRange(`D${row}`).setValue('useSpotUV').setFontColor('#999999').setFontSize(9);
  row++;

  sheet.getRange(`A${row}`).setValue('   → ราคา/ตร.ม.').setFontColor('#666');
  sheet.getRange(`B${row}`).setValue(15).setNumberFormat('#,##0.00');
  sheet.getRange(`D${row}`).setValue('spotUVRate').setFontColor('#999999').setFontSize(9);
  row++;

  sheet.getRange(`A${row}`).setValue('   → ค่าตั้งเครื่อง (฿)').setFontColor('#666');
  sheet.getRange(`B${row}`).setValue(2000).setNumberFormat('#,##0.00');
  sheet.getRange(`D${row}`).setValue('spotUVSetup').setFontColor('#999999').setFontSize(9);
  row++;

  // ไดคัทพิเศษ
  sheet.getRange(`A${row}`).setValue('4. ไดคัทพิเศษ (Special Die-cut)');
  sheet
    .getRange(`B${row}`)
    .setValue('N')
    .setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['Y', 'N']).build());
  sheet.getRange(`C${row}`).setFormula(`=IF(B${row}="Y",specialDieCost,0)`).setNumberFormat('#,##0.00');
  sheet.getRange(`D${row}`).setValue('useSpecialDie').setFontColor('#999999').setFontSize(9);
  row++;

  sheet.getRange(`A${row}`).setValue('   → ค่าแม่พิมพ์ (฿)').setFontColor('#666');
  sheet.getRange(`B${row}`).setValue(5000).setNumberFormat('#,##0.00');
  sheet.getRange(`D${row}`).setValue('specialDieCost').setFontColor('#999999').setFontSize(9);
  row++;

  const optionsEnd = row;
  void optionsEnd;

  // === FILM LAYERS ===
  row++;
  sheet
    .getRange(`A${row}:F${row}`)
    .merge()
    .setValue('📊 ชั้นฟิล์ม (FILM LAYERS)')
    .setFontSize(14)
    .setFontWeight('bold')
    .setBackground('#e8eaf6');

  row++;
  sheet
    .getRange(`A${row}:F${row}`)
    .setValues([['ชั้นฟิล์ม', 'Micron', 'Density', 'ราคา/กก.', 'น้ำหนัก', 'ราคารวม']])
    .setFontWeight('bold')
    .setBackground('#f5f5f5');

  row++;
  const filmStart = row;
  const filmData = [
    ['PET ชั้นบน', 12, 1.38, 50],
    ['ALU Foil', 7, 2.7, 200],
    ['PET ชั้นกลาง', 12, 1.38, 50],
    ['LLDPE', 90, 0.92, 68],
  ];

  filmData.forEach(([name, micron, density, price]) => {
    sheet.getRange(`A${row}`).setValue(name);
    sheet.getRange(`B${row}`).setValue(micron).setNumberFormat('#,##0');
    sheet.getRange(`C${row}`).setValue(density).setNumberFormat('#,##0.00');
    sheet.getRange(`D${row}`).setValue(price).setNumberFormat('#,##0.00');
    sheet
      .getRange(`E${row}`)
      .setFormula(`=IF(totalArea<>"",totalArea*B${row}*C${row}/1000,0)`)
      .setNumberFormat('#,##0.000');
    sheet.getRange(`F${row}`).setFormula(`=E${row}*D${row}`).setNumberFormat('#,##0.00');
    row++;
  });

  const filmEnd = row - 1;
  sheet.getRange(`A${row}:E${row}`).merge().setValue('รวมฟิล์ม').setFontWeight('bold').setBackground('#f5f5f5');
  sheet.getRange(`F${row}`).setFormula(`=SUM(F${filmStart}:F${filmEnd})`).setNumberFormat('#,##0.00');
  const totalFilmRow = row;

  // === CALCULATIONS ===
  row += 2;
  sheet
    .getRange(`A${row}:D${row}`)
    .merge()
    .setValue('🧮 การคำนวณ')
    .setFontSize(14)
    .setFontWeight('bold')
    .setBackground('#e8eaf6');

  row++;
  const calcs = [
    ['พื้นที่/ซอง (ตร.ม.)', '=width*height/1000000'],
    ['ชิ้น/แนวกว้าง', '=INT(webWidth/width)'],
    ['ความยาวงานจริง (m)', '=qty/pcsPerAcross'],
    ['รวมตั้งเสีย (m)', '=printWaste+coatWaste'],
    ['ความยาวรวม (m)', '=actualLength+totalWaste'],
    ['พื้นที่รวม (ตร.ม.)', '=totalLength*webWidth/1000'],
    ['หมึกทั้งหมด (กก.)', '=totalArea*inkPerSqm*colors/1000'],
    ['จำนวนกล้าม', '=ROUNDUP(totalInkKg/canSize,0)'],
    ['กาวทั้งหมด (กก.)', '=totalArea*gluePerSqm/1000'],
  ];

  calcs.forEach(([label, formula]) => {
    sheet.getRange(`A${row}`).setValue(label).setFontWeight('bold');
    sheet.getRange(`B${row}`).setFormula(formula).setNumberFormat('#,##0.00');
    row++;
  });

  // === SUMMARY ===
  row++;
  sheet
    .getRange(`A${row}:D${row}`)
    .merge()
    .setValue('💰 สรุปราคา')
    .setFontSize(14)
    .setFontWeight('bold')
    .setBackground('#e8eaf6');

  row++;
  const summaryStart = row;

  sheet.getRange(`A${row}`).setValue('ค่าสีหมึก').setFontWeight('bold');
  sheet.getRange(`B${row}`).setFormula('=numCans*inkPrice').setNumberFormat('#,##0.00');
  row++;

  sheet.getRange(`A${row}`).setValue('ค่ากาว').setFontWeight('bold');
  sheet.getRange(`B${row}`).setFormula('=totalGlueKg*gluePrice').setNumberFormat('#,##0.00');
  row++;

  sheet.getRange(`A${row}`).setValue('ค่าวัสดุฟิล์ม').setFontWeight('bold');
  sheet.getRange(`B${row}`).setFormula(`=F${totalFilmRow}`).setNumberFormat('#,##0.00');
  row++;

  sheet.getRange(`A${row}`).setValue('ค่าปั๊มนูน/บอด').setFontWeight('bold');
  sheet.getRange(`B${row}`).setFormula(`=C${optionsStart}`).setNumberFormat('#,##0.00');
  row++;

  sheet.getRange(`A${row}`).setValue('ค่าปั๊มทอง').setFontWeight('bold');
  sheet.getRange(`B${row}`).setFormula(`=C${optionsStart + 2}`).setNumberFormat('#,##0.00');
  row++;

  sheet.getRange(`A${row}`).setValue('ค่าสปอต์ UV').setFontWeight('bold');
  sheet.getRange(`B${row}`).setFormula(`=C${optionsStart + 7}`).setNumberFormat('#,##0.00');
  row++;

  sheet.getRange(`A${row}`).setValue('ค่าไดคัทพิเศษ').setFontWeight('bold');
  sheet.getRange(`B${row}`).setFormula(`=C${optionsStart + 9}`).setNumberFormat('#,##0.00');
  row++;

  const summaryEnd = row - 1;

  sheet.getRange(`A${row}:A${row}`).setValue('ต้นทุนรวมทั้งหมด').setFontWeight('bold');
  sheet.getRange(`B${row}`).setFormula(`=SUM(B${summaryStart}:B${summaryEnd})`).setNumberFormat('#,##0.00');
  sheet.getRange(`A${row}:B${row}`).setBackground('#fff3e0');
  row++;

  sheet.getRange(`A${row}`).setValue('ต้นทุนต่อซอง (฿)').setFontWeight('bold');
  sheet.getRange(`B${row}`).setFormula(`=B${row - 1}/qty`).setNumberFormat('#,##0.0000');
  row++;

  sheet.getRange(`A${row}`).setValue('ราคาขายรวม (฿)').setFontWeight('bold');
  sheet.getRange(`B${row}`).setFormula(`=B${row - 2}*(1+profit/100)`).setNumberFormat('#,##0.00');
  sheet.getRange(`A${row}:B${row}`).setBackground('#e8f5e9');
  row++;

  sheet.getRange(`A${row}`).setValue('ราคาขายต่อซอง (฿)').setFontWeight('bold');
  sheet.getRange(`B${row}`).setFormula(`=B${row - 1}/qty`).setNumberFormat('#,##0.0000');
  sheet.getRange(`A${row}:B${row}`).setBackground('#e8f5e9');
  sheet.getRange(`B${row}`).setFontSize(14);

  createFlexibleNamedRanges(sheet);
  Logger.log('✅ Sheet สร้างเสร็จแล้ว!');
}

/**
 * คำนวณค่าปั๊มนูน/บอด
 * ขั้นต่ำ: 2,500฿
 * 10,000 ใบ: 3฿/ใบ
 */
function calculateEmbossCost(qty) {
  const MINIMUM = 2500;
  const RATE_PER_PC = 3;
  const THRESHOLD = 10000;

  if (qty <= 0) return 0;

  if (qty < THRESHOLD) {
    return MINIMUM;
  }

  const cost = qty * RATE_PER_PC;
  return Math.max(cost, MINIMUM);
}

/**
 * คำนวณค่าปั๊มทอง
 * Setup: 3k (<3k ใบ), 5k (3k-13k), 10k (>13k)
 * ค่าแรง: 0.5฿/ใบ
 * ค่าทอง: คำนวณจากพื้นที่
 */
function calculateStampCost(qty, foilAreaCm2) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const foilPrice = ss.getRangeByName('foilPrice').getValue();
  const foilRollSize = ss.getRangeByName('foilRollSize').getValue(); // เมตร

  const LABOR_RATE = 0.5;
  let setupCost = 0;

  if (qty < 3000) {
    setupCost = 3000;
  } else if (qty <= 13000) {
    setupCost = 5000;
  } else {
    setupCost = 10000;
  }

  const foilAreaM2 = (foilAreaCm2 / 10000) * qty;
  const rollsNeeded = Math.ceil(foilAreaM2 / foilRollSize);
  const foilCost = rollsNeeded * foilPrice;

  const laborCost = qty * LABOR_RATE;
  return setupCost + foilCost + laborCost;
}

/**
 * คำนวณค่าสปอต์ UV
 */
function calculateSpotUVCost(qty) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const areaPerPouch = ss.getRangeByName('areaPerPouch').getValue();
  const spotUVRate = ss.getRangeByName('spotUVRate').getValue();
  const spotUVSetup = ss.getRangeByName('spotUVSetup').getValue();

  const totalArea = areaPerPouch * qty;
  const materialCost = totalArea * spotUVRate;

  return spotUVSetup + materialCost;
}

function createFlexibleNamedRanges(sheet) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const names = {
    qty: 'B4',
    width: 'B5',
    height: 'B6',
    webWidth: 'B7',
    colors: 'B8',
    inkPerSqm: 'B9',
    gluePerSqm: 'B10',
    printWaste: 'B11',
    coatWaste: 'B12',
    inkPrice: 'B13',
    canSize: 'B14',
    gluePrice: 'B15',
    profit: 'B16',
    foilArea: 'B21',
    foilPrice: 'B22',
    foilRollSize: 'B23',
    spotUVRate: 'B27',
    spotUVSetup: 'B28',
    specialDieCost: 'B31',
    areaPerPouch: 'B34',
    pcsPerAcross: 'B35',
    actualLength: 'B36',
    totalWaste: 'B37',
    totalLength: 'B38',
    totalArea: 'B39',
    totalInkKg: 'B40',
    numCans: 'B41',
    totalGlueKg: 'B42',
  };

  Object.entries(names).forEach(([name, range]) => {
    try {
      ss.setNamedRange(name, sheet.getRange(range));
    } catch (e) {
      Logger.log(`ไม่สามารถสร้าง: ${name}`);
    }
  });
}

// === OFFSET BOX V2 ===
function createOffsetBoxCalculatorV2() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const oldSheet = ss.getSheetByName('กล่องออฟเซ็ต');
  if (oldSheet) ss.deleteSheet(oldSheet);

  const sheet = ss.insertSheet('กล่องออฟเซ็ต');

  sheet.setColumnWidth(1, 280);
  sheet.setColumnWidth(2, 140);
  sheet.setColumnWidth(3, 140);
  sheet.setColumnWidth(4, 120);

  sheet
    .getRange('A1:D1')
    .merge()
    .setValue('📦 เครื่องคำนวณกล่องออฟเซ็ต (Full Features)')
    .setFontSize(18)
    .setFontWeight('bold')
    .setBackground('#667eea')
    .setFontColor('#ffffff')
    .setHorizontalAlignment('center');

  let row = 3;

  sheet
    .getRange(`A${row}:D${row}`)
    .merge()
    .setValue('📝 ข้อมูลพื้นฐาน')
    .setFontSize(14)
    .setFontWeight('bold')
    .setBackground('#e8eaf6');

  row++;
  const inputs = [
    ['จำนวนกล่อง (pcs)', 10000, 'boxQty'],
    ['จำนวนหน้า/แผ่น (up)', 4, 'upPerSheet'],
    ['กว้างแผ่น (cm)', 65, 'sheetW'],
    ['สูงแผ่น (cm)', 90, 'sheetH'],
    ['กว้างแบน (cm)', 50, 'flatW'],
    ['สูงแบน (cm)', 70, 'flatH'],
    ['GSM', 350, 'gsm'],
    ['ราคากระดาษ (฿/กก.)', 42, 'paperPrice'],
    ['แผ่นตั้งเครื่อง', 300, 'setupSheets'],
    ['% ของเสีย', 5, 'wastePct'],
    ['จำนวนสี', 4, 'colorsBox'],
    ['ราคาเพลท/สี (฿)', 600, 'platePerColor'],
    ['ความเร็ว (sph)', 9000, 'speedSph'],
    ['ค่าพิมพ์ (฿/ชม.)', 2500, 'printRateHr'],
    ['ตั้งเครื่อง (hrs)', 1.2, 'setupHr'],
    ['กำไร (%)', 20, 'profitBox'],
    ['VAT (%)', 7, 'vatBox'],
  ];

  inputs.forEach(([label, value, key]) => {
    sheet.getRange(`A${row}`).setValue(label).setFontWeight('bold');
    sheet.getRange(`B${row}`).setValue(value).setNumberFormat('#,##0.00');
    sheet.getRange(`D${row}`).setValue(key).setFontColor('#999999').setFontSize(9);
    row++;
  });

  row++;
  sheet
    .getRange(`A${row}:D${row}`)
    .merge()
    .setValue('⚙️ คุณสมบัติเสริม')
    .setFontSize(14)
    .setFontWeight('bold')
    .setBackground('#fff3e0');

  row++;
  sheet
    .getRange(`A${row}:D${row}`)
    .setValues([['รายการ', 'ใช้ (Y/N)', 'ค่าใช้จ่าย', 'หมายเหตุ']])
    .setFontWeight('bold')
    .setBackground('#f5f5f5');

  row++;
  const optStart = row;

  sheet.getRange(`A${row}`).setValue('ลามิเนต');
  sheet.getRange(`B${row}`).setValue('N').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['Y', 'N']).build());
  sheet.getRange(`C${row}`).setFormula(`=IF(B${row}="Y",calculateBoxLamCost(),0)`).setNumberFormat('#,##0.00');
  sheet.getRange(`D${row}`).setValue('useLam').setFontColor('#999999').setFontSize(9);
  row++;
  sheet.getRange(`A${row}`).setValue('   → ราคา (฿/ตร.ม.)').setFontColor('#666');
  sheet.getRange(`B${row}`).setValue(12).setNumberFormat('#,##0.00');
  sheet.getRange(`D${row}`).setValue('lamRate').setFontColor('#999999').setFontSize(9);
  row++;

  sheet.getRange(`A${row}`).setValue('ไดคัท');
  sheet.getRange(`B${row}`).setValue('Y').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['Y', 'N']).build());
  sheet.getRange(`C${row}`).setFormula(`=IF(B${row}="Y",calculateBoxDieCost(),0)`).setNumberFormat('#,##0.00');
  sheet.getRange(`D${row}`).setValue('useDie').setFontColor('#999999').setFontSize(9);
  row++;
  sheet.getRange(`A${row}`).setValue('   → ค่าไดคัท/แผ่น (฿)').setFontColor('#666');
  sheet.getRange(`B${row}`).setValue(1.8).setNumberFormat('#,##0.00');
  sheet.getRange(`D${row}`).setValue('dieRate').setFontColor('#999999').setFontSize(9);
  row++;

  sheet.getRange(`A${row}`).setValue('   → ค่าแม่พิมพ์ไดคัท (฿)').setFontColor('#666');
  sheet.getRange(`B${row}`).setValue(4500).setNumberFormat('#,##0.00');
  sheet.getRange(`D${row}`).setValue('dieSetup').setFontColor('#999999').setFontSize(9);

  row += 2;
  sheet.getRange(`A${row}:D${row}`).merge().setValue('🧮 การคำนวณ').setFontSize(14).setFontWeight('bold').setBackground('#e8eaf6');

  row++;
  const calcStart = row;
  const calcs = [
    ['พื้นที่แผ่น (ตร.ม.)', '=sheetW*sheetH/10000'],
    ['พื้นที่แบน/กล่อง (ตร.ม.)', '=flatW*flatH/10000'],
    ['จำนวนแผ่นงาน', '=ROUNDUP(boxQty/upPerSheet,0)'],
    ['จำนวนแผ่นรวมของเสีย', '=ROUNDUP(requiredSheets*(1+wastePct/100)+setupSheets,0)'],
    ['น้ำหนักกระดาษรวม (kg)', '=totalSheets*sheetArea*gsm/1000'],
    ['ค่ากระดาษ', '=paperKg*paperPrice'],
    ['ค่าเพลท', '=colorsBox*platePerColor'],
    ['ชั่วโมงพิมพ์', '=totalSheets/speedSph+setupHr'],
    ['ค่าพิมพ์', '=printHours*printRateHr'],
  ];
  calcs.forEach(([label, formula]) => {
    sheet.getRange(`A${row}`).setValue(label).setFontWeight('bold');
    sheet.getRange(`B${row}`).setFormula(formula).setNumberFormat('#,##0.00');
    row++;
  });

  row++;
  sheet.getRange(`A${row}:D${row}`).merge().setValue('💰 สรุปราคา').setFontSize(14).setFontWeight('bold').setBackground('#e8eaf6');

  row++;
  const summaryStart = row;
  sheet.getRange(`A${row}`).setValue('ค่ากระดาษ').setFontWeight('bold');
  sheet.getRange(`B${row}`).setFormula('=paperCost').setNumberFormat('#,##0.00');
  row++;
  sheet.getRange(`A${row}`).setValue('ค่าเพลท').setFontWeight('bold');
  sheet.getRange(`B${row}`).setFormula('=plateCost').setNumberFormat('#,##0.00');
  row++;
  sheet.getRange(`A${row}`).setValue('ค่าพิมพ์').setFontWeight('bold');
  sheet.getRange(`B${row}`).setFormula('=printCost').setNumberFormat('#,##0.00');
  row++;
  sheet.getRange(`A${row}`).setValue('ค่าลามิเนต').setFontWeight('bold');
  sheet.getRange(`B${row}`).setFormula(`=C${optStart}`).setNumberFormat('#,##0.00');
  row++;
  sheet.getRange(`A${row}`).setValue('ค่าไดคัท').setFontWeight('bold');
  sheet.getRange(`B${row}`).setFormula(`=C${optStart + 2}`).setNumberFormat('#,##0.00');
  row++;

  const summaryEnd = row - 1;
  sheet.getRange(`A${row}`).setValue('ต้นทุนรวม').setFontWeight('bold');
  sheet.getRange(`B${row}`).setFormula(`=SUM(B${summaryStart}:B${summaryEnd})`).setNumberFormat('#,##0.00');
  sheet.getRange(`A${row}:B${row}`).setBackground('#fff3e0');
  row++;
  sheet.getRange(`A${row}`).setValue('ราคาขายก่อน VAT').setFontWeight('bold');
  sheet.getRange(`B${row}`).setFormula(`=B${row - 1}*(1+profitBox/100)`).setNumberFormat('#,##0.00');
  sheet.getRange(`A${row}:B${row}`).setBackground('#e8f5e9');
  row++;
  sheet.getRange(`A${row}`).setValue('ราคาขายรวม VAT').setFontWeight('bold');
  sheet.getRange(`B${row}`).setFormula(`=B${row - 1}*(1+vatBox/100)`).setNumberFormat('#,##0.00');
  sheet.getRange(`A${row}:B${row}`).setBackground('#e8f5e9');

  createOffsetBoxNamedRanges(sheet, calcStart);
}

function calculateBoxLamCost() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const lamRate = ss.getRangeByName('lamRate').getValue();
  const totalSheets = ss.getRangeByName('totalSheets').getValue();
  const sheetArea = ss.getRangeByName('sheetArea').getValue();
  return lamRate * totalSheets * sheetArea;
}

function calculateBoxDieCost() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dieRate = ss.getRangeByName('dieRate').getValue();
  const dieSetup = ss.getRangeByName('dieSetup').getValue();
  const totalSheets = ss.getRangeByName('totalSheets').getValue();
  return dieSetup + (dieRate * totalSheets);
}

function createOffsetBoxNamedRanges(sheet, calcStart) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const names = {
    boxQty: 'B4',
    upPerSheet: 'B5',
    sheetW: 'B6',
    sheetH: 'B7',
    flatW: 'B8',
    flatH: 'B9',
    gsm: 'B10',
    paperPrice: 'B11',
    setupSheets: 'B12',
    wastePct: 'B13',
    colorsBox: 'B14',
    platePerColor: 'B15',
    speedSph: 'B16',
    printRateHr: 'B17',
    setupHr: 'B18',
    profitBox: 'B19',
    vatBox: 'B20',
    lamRate: 'B25',
    dieRate: 'B28',
    dieSetup: 'B29',
    sheetArea: `B${calcStart}`,
    flatArea: `B${calcStart + 1}`,
    requiredSheets: `B${calcStart + 2}`,
    totalSheets: `B${calcStart + 3}`,
    paperKg: `B${calcStart + 4}`,
    paperCost: `B${calcStart + 5}`,
    plateCost: `B${calcStart + 6}`,
    printHours: `B${calcStart + 7}`,
    printCost: `B${calcStart + 8}`,
  };

  Object.entries(names).forEach(([name, range]) => {
    try {
      ss.setNamedRange(name, sheet.getRange(range));
    } catch (e) {
      Logger.log(`ไม่สามารถสร้าง: ${name}`);
    }
  });
}
