'use strict';
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType,
  VerticalAlign, PageNumber, PageBreak, Footer, TableOfContents,
} = require('docx');

const FONT = 'Meiryo UI';
const PAGE_W = 11906, PAGE_H = 16838, MARGIN = 1080;
const CW = PAGE_W - MARGIN * 2;

const v  = (x, fb='') => (x && String(x).trim()) ? String(x).trim() : fb;
const vd = x => v(x, '　');

const BK = { style: BorderStyle.SINGLE, size: 4, color: '000000' };
const BD = { top:BK, bottom:BK, left:BK, right:BK };

const mkCell = (text, opts={}) => new TableCell({
  borders: BD,
  width: opts.w ? {size:opts.w, type:WidthType.DXA} : undefined,
  verticalAlign: VerticalAlign.CENTER,
  columnSpan: opts.span || 1,
  margins: {top:60, bottom:60, left:100, right:100},
  children: [new Paragraph({
    alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT,
    children: [new TextRun({text:String(text), font:FONT, size:opts.sz||18, bold:!!opts.bold})]
  })]
});

const hCell   = (t,w,sp) => mkCell(t, {w, bold:true, center:true, span:sp||1});
const lCell   = (t,w)    => mkCell(t, {w, bold:true});
const secCell = (t, sp)  => new TableCell({
  borders:BD, columnSpan:sp,
  margins:{top:60,bottom:60,left:100,right:100},
  children:[new Paragraph({children:[new TextRun({text:t, font:FONT, size:18, bold:true})]})]
});
const totCell = (t,w)    => mkCell(t, {w, bold:true});
const row2    = (lbl,val,w1=3000,w2=6746) => new TableRow({children:[lCell(lbl,w1), mkCell(vd(val),{w:w2})]});

const para  = (text, opts={}) => new Paragraph({
  alignment: opts.right ? AlignmentType.RIGHT : AlignmentType.LEFT,
  spacing: {before:opts.before||40, after:opts.after||40},
  children: [new TextRun({text:String(text), font:FONT, size:opts.sz||20, bold:!!opts.bold})]
});
const emptyP = () => new Paragraph({children:[new TextRun({text:''})], spacing:{before:20,after:20}});
const pb     = () => new Paragraph({children:[new PageBreak()]});

const h1 = t => new Paragraph({heading:HeadingLevel.HEADING_1, spacing:{before:280,after:140}, children:[new TextRun({text:t, font:FONT, size:28, bold:true})]});
const h2 = t => new Paragraph({heading:HeadingLevel.HEADING_2, spacing:{before:200,after:100}, children:[new TextRun({text:t, font:FONT, size:24, bold:true})]});
const h3 = t => new Paragraph({heading:HeadingLevel.HEADING_3, spacing:{before:140,after:60},  children:[new TextRun({text:t, font:FONT, size:20, bold:true})]});

const emptyRows = (n, widths) => [...Array(n)].map(()=>new TableRow({children:widths.map(w=>mkCell('',{w}))}));

// フォームの行データ → Wordテーブル行に変換
function formRowsToTableRows(rows, widths) {
  return (rows||[]).map(row => {
    if (row.type==='section') {
      return new TableRow({children:[secCell(v(row.label,''), widths.length)]});
    }
    if (row.type==='total') {
      return new TableRow({children:(row.cells||[]).map((c,i)=>totCell(vd(c), widths[i]||2000))});
    }
    return new TableRow({children:(row.cells||[]).map((c,i)=>mkCell(vd(c), {w:widths[i]||2000}))});
  });
}

async function generateWord(d) {
  const children = [];

  // ========== 表紙 ==========
  children.push(
    emptyP(), emptyP(), emptyP(),
    new Paragraph({alignment:AlignmentType.CENTER, spacing:{before:400,after:400},
      children:[new TextRun({text:'船　体　部　仕　様　書', font:FONT, size:52, bold:true})]}),
    emptyP(),
    new Table({width:{size:CW,type:WidthType.DXA}, columnWidths:[2500,7246], rows:[
      new TableRow({children:[lCell('船　　名',2500), mkCell(vd(d.ship_name),{w:7246,sz:24,bold:true})]}),
      new TableRow({children:[lCell('船　種',2500),   mkCell(vd(d.ship_type),{w:7246})]}),
      new TableRow({children:[lCell('工事番号',2500),  mkCell(vd(d.project_no),{w:7246})]}),
      new TableRow({children:[lCell('造 船 所',2500),  mkCell(vd(d.shipyard,'鈴木造船株式会社'),{w:7246})]}),
      new TableRow({children:[lCell('作 成 日',2500),  mkCell(vd(d.create_date),{w:7246})]}),
      new TableRow({children:[lCell('改 訂 番 号',2500),mkCell(vd(d.rev_no,'Rev.1'),{w:7246})]}),
    ]}),
    emptyP(),
    para('改 訂 履 歴',{bold:true}),
    new Table({width:{size:CW,type:WidthType.DXA}, columnWidths:[1500,2000,1500,4746], rows:[
      new TableRow({children:[hCell('Rev.No.',1500),hCell('改 訂 日',2000),hCell('改 訂 者',1500),hCell('改 訂 内 容',4746)]}),
      new TableRow({children:[mkCell('Rev.1',{w:1500,center:true}),mkCell('',{w:2000}),mkCell('',{w:1500}),mkCell('初版作成',{w:4746})]}),
      new TableRow({children:[mkCell('Rev.2',{w:1500,center:true}),mkCell('',{w:2000}),mkCell('',{w:1500}),mkCell('',{w:4746})]}),
      new TableRow({children:[mkCell('Rev.3',{w:1500,center:true}),mkCell('',{w:2000}),mkCell('',{w:1500}),mkCell('',{w:4746})]}),
    ]}),
    pb(),
  );

  // ========== 目次 ==========
  children.push(
    new Paragraph({alignment:AlignmentType.CENTER, spacing:{before:80,after:120}, children:[new TextRun({text:'目　　　次', font:FONT, size:26, bold:true})]}),
    new TableOfContents('目次', {hyperlink:true, headingStyleRange:'1-3'}),
    emptyP(),
    para('※ Wordで開いた後、目次を右クリック →「フィールドの更新」→「目次全体を更新する」でページ番号が入ります。',{sz:16}),
    pb(),
  );

  // ========== 1. 一般計画 ==========
  const lpp_b_d = [d.plan_lpp, d.plan_b, d.plan_d].filter(Boolean).join('×');
  const mainDimText = lpp_b_d ? `垂線間長：${d.plan_lpp}ｍ　幅（型）：${d.plan_b}ｍ　深さ（型）：${d.plan_d}ｍ　計画満載吃水（型）：${d.plan_draft}ｍ` : '';

  children.push(
    h1('１．一般計画'),
    h2('(1)　航行区域及び就航予定航路'),
    new Table({width:{size:CW,type:WidthType.DXA}, columnWidths:[3000,6746], rows:[row2('航行区域',d.nav_area,3000,6746)]}),
    emptyP(),
    h2('(2)　用途及び予定貨物'),
    new Table({width:{size:CW,type:WidthType.DXA}, columnWidths:[3000,6746], rows:[row2('用途',d.purpose,3000,6746),row2('予定貨物',d.cargo,3000,6746)]}),
    emptyP(),
    h2('(3)　本船計画の基本方針'),
    para(`本船は、一般配置図に示す様に${v(d.hull_type,'船首楼・船尾楼付一層甲板船尾機関型')}のタンカーである。`),
    para(v(d.plan_body_desc,'尚、本船は十分なる復原性と良好なる推進性能及び操縦性能に留意し、油タンカー本来の使命に合致した経済船を目的として、仕様書細部に至る迄検討を加えて本船就航の上に高位な採算性を確保し得るものとする。')),
    para('尚、船殻強度は軽減規則を適用せず近海構造とする。'),
    emptyP(),
    new Table({width:{size:CW,type:WidthType.DXA}, columnWidths:[3000,6746], rows:[
      row2('載貨重量', v(d.dwt_s)+' トン', 3000, 6746),
      row2('載貨容積', v(d.cargo_vol_s)+' ｍ³', 3000, 6746),
      row2('船型', vd(d.hull_type), 3000, 6746),
      row2('主要寸法', mainDimText, 3000, 6746),
      row2('満載航海速力', `${v(d.plan_speed_detail)}　${v(d.speed_s)}ノット`, 3000, 6746),
      row2('主機関', vd(d.plan_engine_detail), 3000, 6746),
    ]}),
    emptyP(),
  );

  // ========== 2. 保証事項 ==========
  children.push(
    h1('２．保証事項等'),
    h2('(1)　保証事項'),
    new Table({width:{size:CW,type:WidthType.DXA}, columnWidths:[4000,5746], rows:[
      new TableRow({children:[hCell('保証項目',4000),hCell('保証値・条件',5746)]}),
      row2('貨物容積', v(d.gvol)+' ㎥以上', 4000, 5746),
      row2('試運転最高速力', vd(d.gspeed), 4000, 5746),
    ]}),
    emptyP(),
  );

  // ========== 3. 主要要目 ==========
  children.push(
    h1('３．主要要目等'),
    h2('(1)　用途・船型'),
    new Table({width:{size:CW,type:WidthType.DXA}, columnWidths:[3000,6746], rows:[
      row2('用途',d.use||d.purpose,3000,6746), row2('船型',vd(d.hull_d||d.hull_type),3000,6746),
    ]}),
    emptyP(),
    h2('(2)　船級・航行区域等'),
    new Table({width:{size:CW,type:WidthType.DXA}, columnWidths:[3000,6746], rows:[
      row2('航行区域・種別',vd(d.navc),3000,6746),
      row2('船級',vd(d.ship_class),3000,6746),
      row2('適用法規',vd(d.reg),3000,6746),
    ]}),
    emptyP(),
    h2('(3)　主要寸法・容積等'),
    h3('■ 船体主要寸法'),
  );

  // 主要寸法テーブル
  if((d.dimRows||[]).length>0){
    children.push(
      new Table({width:{size:CW,type:WidthType.DXA}, columnWidths:[4200,2400,1200,1946], rows:[
        new TableRow({children:[hCell('寸法項目',4200),hCell('計画値',2400),hCell('単位',1200),hCell('備考',1946)]}),
        ...formRowsToTableRows(d.dimRows,[4200,2400,1200,1946]),
      ]}),
      emptyP(),
    );
  }

  children.push(h3('■ 載貨容積　タンク容量一覧'));

  // タンクテーブル
  if((d.tankRows||[]).length>0){
    children.push(
      new Table({width:{size:CW,type:WidthType.DXA}, columnWidths:[4200,2400,1200,1946], rows:[
        new TableRow({children:[hCell('タンク名称',4200),hCell('容量（m³）',2400),hCell('区画',1200),hCell('備考',1946)]}),
        ...formRowsToTableRows(d.tankRows,[4200,2400,1200,1946]),
        new TableRow({children:[new TableCell({columnSpan:4,borders:BD,margins:{top:60,bottom:60,left:100,right:100},
          children:[new Paragraph({children:[new TextRun({text:'※ その他のタンクは機関部仕様書による。',font:FONT,size:16})]})]})]})
      ]}),
      emptyP(),
    );
  }

  // 主機関テーブル
  const ekwStr = [d.ekw?`${d.ekw}KW`:'', d.ekw_ps?`(${d.ekw_ps}PS)`:'', d.ekw_rpm?`× ${d.ekw_rpm}min⁻¹`:''].filter(Boolean).join(' ');
  const ekw85Str = [d.ekw85?`${d.ekw85}KW`:'', d.ekw85_ps?`(${d.ekw85_ps}PS)`:'', d.ekw85_rpm?`× ${d.ekw85_rpm}min⁻¹`:''].filter(Boolean).join(' ');

  children.push(
    h2('(4)　主機関'),
    new Table({width:{size:CW,type:WidthType.DXA}, columnWidths:[3000,4500,1100,1146], rows:[
      new TableRow({children:[hCell('項目',3000),hCell('仕様内容',4500),hCell('単位',1100),hCell('備考',1146)]}),
      new TableRow({children:[lCell('主機関種別',3000),mkCell(vd(d.etype),{w:4500}),mkCell('',{w:1100}),mkCell('',{w:1146})]}),
      new TableRow({children:[lCell('メーカー',3000),mkCell(vd(d.emkr),{w:4500}),mkCell('',{w:1100}),mkCell('',{w:1146})]}),
      new TableRow({children:[lCell('型式',3000),mkCell(vd(d.emdl),{w:4500}),mkCell('',{w:1100}),mkCell('',{w:1146})]}),
      new TableRow({children:[lCell('連続最大出力',3000),mkCell(vd(ekwStr||d.ekw),{w:4500}),mkCell('ＫＷ',{w:1100,center:true}),mkCell(d.ekw_ps?`${d.ekw_ps}ＰＳ × ${d.ekw_rpm}ｍｉｎ⁻¹`:'',{w:1146})]}),
      new TableRow({children:[lCell('常用出力（85%負荷）',3000),mkCell(vd(ekw85Str||d.ekw85),{w:4500}),mkCell('ＫＷ',{w:1100,center:true}),mkCell(d.ekw85_ps?`${d.ekw85_ps}ＰＳ × ${d.ekw85_rpm}ｍｉｎ⁻¹`:'',{w:1146})]}),
      new TableRow({children:[lCell('使用燃料',3000),mkCell(vd(d.fuel),{w:4500}),mkCell('',{w:1100}),mkCell('',{w:1146})]}),
    ]}),
    emptyP(),
    h2('(5)　速力及び航続距離'),
    new Table({width:{size:CW,type:WidthType.DXA}, columnWidths:[3000,4500,1100,1146], rows:[
      new TableRow({children:[hCell('項目',3000),hCell('値',4500),hCell('単位',1100),hCell('備考',1146)]}),
      new TableRow({children:[lCell('満載航海速力',3000),mkCell(vd(d.spd),{w:4500}),mkCell('ノット',{w:1100,center:true}),mkCell(vd(d.spd_detail),{w:1146})]}),
      new TableRow({children:[lCell('航続距離',3000),mkCell(vd(d.rng),{w:4500}),mkCell('海里',{w:1100,center:true}),mkCell('',{w:1146})]}),
    ]}),
    emptyP(),
    h2('(6)　無線装置'),
    new Table({width:{size:CW,type:WidthType.DXA}, columnWidths:[3000,6746], rows:[
      row2('電話・FAX',d.tel,3000,6746), row2('ＬＡＮ配線',d.lan,3000,6746), row2('その他無線機器',d.radio,3000,6746),
    ]}),
    emptyP(),
    h2('(7)　乗組員及び最大搭載人員'),
  );

  const cT = (parseInt(d.crew_d)||0)+(parseInt(d.crew_e)||0)+(parseInt(d.crew_da)||0)+(parseInt(d.crew_ea)||0);
  children.push(
    new Table({width:{size:CW,type:WidthType.DXA}, columnWidths:[2500,3500,1000,1746], rows:[
      new TableRow({children:[hCell('区分',2500),hCell('職名',3500),hCell('人数',1000),hCell('備考',1746)]}),
      new TableRow({children:[lCell('職員（甲板部）',2500),mkCell(vd(d.crew_d_name),{w:3500}),mkCell(v(d.crew_d,''),{w:1000,center:true}),mkCell('',{w:1746})]}),
      new TableRow({children:[lCell('職員（機関部）',2500),mkCell(vd(d.crew_e_name),{w:3500}),mkCell(v(d.crew_e,''),{w:1000,center:true}),mkCell('',{w:1746})]}),
      new TableRow({children:[lCell('部員（甲板部）',2500),mkCell(vd(d.crew_da_name),{w:3500}),mkCell(v(d.crew_da,''),{w:1000,center:true}),mkCell('',{w:1746})]}),
      new TableRow({children:[lCell('部員（機関部）',2500),mkCell(vd(d.crew_ea_name),{w:3500}),mkCell(v(d.crew_ea,''),{w:1000,center:true}),mkCell('',{w:1746})]}),
      new TableRow({children:[totCell('乗組員合計',2500),totCell('',3500),totCell(cT>0?String(cT):'',1000),totCell('',1746)]}),
      new TableRow({children:[lCell('その他の者',2500),mkCell('',{w:3500}),mkCell(v(d.crew_other,''),{w:1000,center:true}),mkCell('',{w:1746})]}),
      new TableRow({children:[totCell('最大搭載人員',2500),totCell('',3500),totCell(v(d.crew_max,''),1000),totCell('',1746)]}),
    ]}),
    emptyP(),
    h2('(8)　一般事項'),
    h3('■ 総則'),
    para('この節の記述は船体部の仕様書のみならず、機関部・電気部の建造仕様書に対しても特別の記載なき限り適用する。'),
    para('本船は、満載状態において（貨物・燃料・清水・食料・乗組員及びその携帯品を搭載し、脚荷水を搭載することなく）船首脚にならぬよう計画建造する。又、その他の状態においても適当なる船尾吃水を有するよう計画する。本船完成後傾斜試験を行い、各種状態におけるトリム及び復原力計算書を作成し、管海官庁の承認を受けた後、船主殿に提出する。'),
    emptyP(),
    h3('■ 諸試験（工事完了後実施）'),
    new Table({width:{size:CW,type:WidthType.DXA}, columnWidths:[800,8946], rows:[
      new TableRow({children:[hCell('No.',800),hCell('試験項目',8946)]}),
      ...['速力試験','旋回力試験','操舵試験・予備操舵試験','前後進試験','投揚錨試験','バウスラスター試験','貨物油ポンプ試験（納入メーカー立会い）','その他船主の要求する事項']
        .map((t,i)=>new TableRow({children:[mkCell(String(i+1),{w:800,center:true}),mkCell(t,{w:8946})]})),
    ]}),
    emptyP(),
    h3('■ 規格及び標準等'),
    para('本船に使用する材料・艤装品及び装備品は船舶安全法の規則に適合した材料を採用し、その他についてはＪＩＳ表示製品を極力採用する。名称板等は原則として日本文字を使用し、本設計及び工事に関してはメートル制を用いる。'),
    emptyP(),
    h3('■ 検査及び引渡し（証書類各２部）'),
    new Table({width:{size:CW,type:WidthType.DXA}, columnWidths:[800,8946], rows:[
      ...['船舶国籍証書','船舶検査証書','船舶検査手帳','船舶件名表','貨物油槽全容積鑑定書（新日本検定協会）','載貨重量鑑定書（新日本検定協会）','海洋汚染防止証書','海洋汚染防止検査手帳','その他属具備品に関する諸証明書']
        .map((t,i)=>new TableRow({children:[mkCell(String(i+1),{w:800,center:true}),mkCell(t,{w:8946})]})),
    ]}),
    emptyP(),
    h3('■ 船主支給品（標準区分）'),
    new Table({width:{size:CW,type:WidthType.DXA}, columnWidths:[2500,7246], rows:[
      new TableRow({children:[hCell('区分',2500),hCell('品目（主なもの）',7246)]}),
      row2('航海関係','海図・水路書誌類',2500,7246),
      row2('生活用品','賄具及び食器類、寝具及び毛布類、薬品及び医療器具類、事務用品諸消耗品',2500,7246),
      row2('索具・燃料','索具類（法定以外・コンビロープ）、試運転用燃料油（使用分は造船所負担）',2500,7246),
      row2('安全用品','安全帽・安全靴・防護服等諸備品',2500,7246),
      row2('通信機器','船舶電話',2500,7246),
      row2('荷役関係','荷役ホース、甲板機械システム油、主機潤滑油、その他油脂類',2500,7246),
    ]}),
    emptyP(), pb(),
  );

  // ========== 4. 各部の仕様 ==========
  children.push(
    h1('４．各部の仕様'),
    h2('(1)　船体部一般'),
    para('本船は船首楼・船尾楼付一層甲板船で、船首はバルバス型、船尾はトランサム型とし、一般配置図に示す如く機関室及び甲板室を船体後部に設け、居住区その他の各室を配置する。'),
    para('船体は７カ所に区画され、船首水槽・スラスター室・深水タンク・貨物油槽・ポンプ室・機関室・船尾水槽を配置する。'),
    para('又、貨物油槽下部は全部、機関室は一部二重底構造とし、海水バラスト及び油を搭載しうる構造とする。'),
    emptyP(),
    h2('(2)　船殻一般'),
    h3('■ 材料・工事'),
    para('船体主要部に用いる鋼材等は、ＮＫ及び船舶安全法の定める規格を満足する材料とし、鋳巣その他欠陥のないものを使用する。工事は親切丁寧に施工し、特に電気溶接による残留応力・歪等を少なくするよう留意する。'),
    para('尚、クロスバット等必要箇所及び船主指定箇所はＸ線検査を行う。撮影箇所は船の長さ（ｍ）と同じ枚数を基準とする。'),
    h3('■ 構造'),
    new Table({width:{size:CW,type:WidthType.DXA}, columnWidths:[3000,6746], rows:[
      row2('中央部構造','船底・船側及び上甲板はすべて縦式構造とする。'),
      row2('溶接','船殻はすべて溶接構造とする。'),
      row2('貨物油槽強度','１．０２５ＫＴ／ｍ³とする。'),
    ]}),
    emptyP(),
    h2('(3)　船殻鉄鋼工事'),
    new Table({width:{size:CW,type:WidthType.DXA}, columnWidths:[2500,7246], rows:[
      new TableRow({children:[hCell('項目',2500),hCell('仕様内容',7246)]}),
      ...[ ['舵','十分な面積を有する広角度舵とする。舵面積比：約１／５０'],
           ['龍骨','平板龍骨とし、縦横縁共溶接とし船首尾において船首材・船尾材と固着する。'],
           ['外板','各外板及び舷側厚板は規定の厚さ以上のものを使用し、ホースパイプ取付部及び海水吸入箱等開口部の周囲は増厚又は二重張りにより十分補強する。外板にはチェーンずれを各舷４条なるべく長く取付ける。'],
           ['肋骨','貨物油槽部は横肋骨方式とする。組立式及び型鋼を使用する。槽内及び機関室内適当箇所に特設肋骨を設ける。'],
           ['隔壁','水密隔壁は一般配置図の通り設ける。貨物槽は縦通隔壁１条を設け、中心線縦隔壁はコルゲート、横隔壁及び縦隔壁は平板式とし、堅式防撓材構造とする。'],
           ['二重底','貨物油槽の底部は縦式二重底構造とし、機関室の一部を二重底構造とする。'],
           ['上甲板及び船楼甲板','上甲板及び船楼甲板は鋼甲板とし、上甲板の貨物油槽部の梁は縦通梁とし、その他上甲板梁は横置梁とする。揚錨機・係船機・その他揚錨係船器具類の下部は十分補強する。'],
           ['主機台・補機台','主機台は船底構造と一体のものとして堅牢な構造とする。主機台桁板は十分前後に延長し主機の荷重及び振動に耐えうる構造とする。補機台はすべて溶接構造とし重量・荷重等に対し十分強固なものとする。'],
           ['膨張トランク','貨物油槽ＮＯ１〜ＮＯ５ＣＯＴに設ける。高さ：０．８３６ｍ〜０．８７０ｍ、幅：８．４０ｍ、コーミング高さ：０．１６ｍ〜０．２６ｍ'],
           ['舷檣','一般配置図に示す位置に高さ１．０ｍのブルワーク及びハンドレールを設ける。通電性を良くするため一部手摺にＳＵＳを使用する。'],
           ['錨鎖庫','船首隔壁後方に十分なる容積を有する錨鎖庫を設ける。中央には鋼製仕切壁、人孔を両舷に、フットホールを中央仕切壁に備え、底部にビルジウエルを設ける。庫内及び周囲は木製内張りとする。'],
           ['船楼及び甲板室','船楼及び甲板室はすべて鋼製とし、十分強力な構造とする。機関室囲壁は鋼製とし、一般配置図に示す位置に出入口扉を設け、頂部には煙突天窓及び通風筒を設ける。'],
      ].map(([a,b])=>row2(a,b,2500,7246)),
    ]}),
    emptyP(),
    h2('(4)　船殻木工工事'),
    para('充分に乾燥し、欠陥のないものを使用する。居住区内仕切壁は防音措置のため鋼製仕切とし木製仕切は設備しない。'),
    emptyP(),
  );

  // (5) 開口閉鎖装置
  children.push(
    h2('(5)　開口閉鎖装置（木製扉は含まない）'),
    new Table({width:{size:CW,type:WidthType.DXA}, columnWidths:[1300,2000,1500,600,2300,1046], rows:[
      new TableRow({children:[hCell('位置',1300),hCell('名称',2000),hCell('寸法及び数',1500),hCell('数',600),hCell('材質・閉鎖方式',2300),hCell('備考',1046)]}),
      ...formRowsToTableRows(d.openRows||[],[1300,2000,1500,600,2300,1046]),
    ]}),
    emptyP(),
  );

  // (6) マスト
  children.push(
    h2('(6)　マスト及びデリックポスト'),
    new Table({width:{size:CW,type:WidthType.DXA}, columnWidths:[2000,1500,700,1600,2500,1446], rows:[
      new TableRow({children:[hCell('項目',2000),hCell('位置',1500),hCell('数',700),hCell('材質',1600),hCell('付属物',2500),hCell('備考',1446)]}),
      ...formRowsToTableRows(d.mastRows||[],[2000,1500,700,1600,2500,1446]),
    ]}),
    emptyP(),
  );

  // (7) 揚錨・係船
  children.push(
    h2('(7)　揚錨及び係船器具'),
    new Table({width:{size:CW,type:WidthType.DXA}, columnWidths:[2500,1500,700,1800,1800,1446], rows:[
      new TableRow({children:[hCell('項目',2500),hCell('位置',1500),hCell('数',700),hCell('型式',1800),hCell('力量等',1800),hCell('備考',1446)]}),
      ...formRowsToTableRows(d.anchRows||[],[2500,1500,700,1800,1800,1446]),
    ]}),
    emptyP(),
    h3('■ 係船器具明細'),
    new Table({width:{size:CW,type:WidthType.DXA}, columnWidths:[1500,1500,1800,600,1300,1400,1646], rows:[
      new TableRow({children:[hCell('区分',1500),hCell('取付位置',1500),hCell('名称',1800),hCell('数',600),hCell('寸法',1300),hCell('材質',1400),hCell('備考',1646)]}),
      ...formRowsToTableRows(d.keisRows||[],[1500,1500,1800,600,1300,1400,1646]),
    ]}),
    emptyP(),
  );

  // (8) 操舵装置
  const rmotStr = [d.rmot_v?`${d.rmot_v}Ｖ`:'', d.rmot_kw?`${d.rmot_kw}ＫＷ`:'', d.rmot_num?`× ${d.rmot_num}台`:''].filter(Boolean).join(' × ');
  children.push(
    h2('(8)　操舵装置'),
    new Table({width:{size:CW,type:WidthType.DXA}, columnWidths:[3000,6746], rows:[
      new TableRow({children:[hCell('項目',3000),hCell('仕様',6746)]}),
      row2('操舵装置型式', d.rtype+(d.rknm?`　${d.rknm}ＫＮｍ × １台`:''), 3000, 6746),
      row2('電動機', rmotStr, 3000, 6746),
      row2('メーカー', d.rmkr, 3000, 6746),
      row2('自動操舵', d.auto, 3000, 6746),
      row2('バウスラスター型式', (d.btype||'')+(d.bthrust_blade?`　${d.bthrust_blade}`:''), 3000, 6746),
      row2('バウスラスター推力', d.bthrust, 3000, 6746),
      row2('バウスラスター電動機', d.bmot, 3000, 6746),
    ]}),
    emptyP(),
  );

  // (9) 荷役装置
  const pumpVolStr = [d.pump_vol?`${d.pump_vol}m³/H`:'', d.pump_press?`× ${d.pump_press}MPaG`:'', d.pump_ps?`× ${d.pump_ps}PS`:'', d.pump_rpm?`× ${d.pump_rpm}min⁻¹`:''].filter(Boolean).join(' ');
  children.push(
    h2('(9)　荷役装置'),
    h3('■ 貨物油ポンプ'),
    new Table({width:{size:CW,type:WidthType.DXA}, columnWidths:[3000,6746], rows:[
      new TableRow({children:[hCell('項目',3000),hCell('仕様',6746)]}),
      row2('メーカー', d.pump_mkr, 3000, 6746),
      row2('型式', d.pump_type+(d.pump_num?` × ${d.pump_num}台`:''), 3000, 6746),
      row2('容量', pumpVolStr, 3000, 6746),
      row2('構造', d.pump_struct, 3000, 6746),
      row2('材質', d.pump_mat, 3000, 6746),
      row2('駆動', d.pump_drive, 3000, 6746),
    ]}),
    emptyP(),
    h3('■ 荷役制御装置（甲板上遠隔制御）'),
    new Table({width:{size:CW,type:WidthType.DXA}, columnWidths:[600,9146], rows:[
      new TableRow({children:[hCell('',600),hCell('装備内容',9146)]}),
      ...['カーゴポンプ・残油ポンプ：発停装置、圧力計・連成計','制御空気圧力計','主機回転制御','カーゴポンプ吐出圧力上昇警報','クラッチ制御空気圧力低下警報','各ポンプケーシング・スタフィンボックス・ベアリング温度上昇警報']
        .map((t,i)=>new TableRow({children:[mkCell(String(i+1),{w:600,center:true}),mkCell(t,{w:9146})]})),
    ]}),
    emptyP(),
    h3('■ バルブ材質'),
    new Table({width:{size:CW,type:WidthType.DXA}, columnWidths:[2500,2500,2500,2246], rows:[
      new TableRow({children:[hCell('種別',2500),hCell('本体（弁箱）',2500),hCell('弁体',2500),hCell('圧力',2246)]}),
      ...formRowsToTableRows(d.valvRows||[],[2500,2500,2500,2246]),
    ]}),
    emptyP(),
    h3('■ 荷役関連ポンプ等'),
    new Table({width:{size:CW,type:WidthType.DXA}, columnWidths:[3000,6746], rows:[
      new TableRow({children:[hCell('機器名称',3000),hCell('仕様・メーカー',6746)]}),
      ...formRowsToTableRows(d.pumpRows||[],[3000,6746]),
    ]}),
    emptyP(),
    para('※ 静電気防止対策：サンディングパイプ・カーゴハッチ・マニホールド・階段（上甲板〜船楼）等適切な場所に除電棒・アース板を設ける。',{sz:18}),
    emptyP(),
  );

  // (10) 居住区（固定文）
  children.push(
    h2('(10)　船内居住区設備等'),
    h3('■ 居住区設備の概要'),
    para('居室は各個室とし、一般配置図に示す如く設ける。側壁及び天井は防火に配慮した新建材にて内張りし、暴露部に接する居室・船橋・食堂の天井側壁並びに操舵室の天井側壁は50mmグラスウールにて防熱する。クリアハイトは2,030mm以上とする。'),
    para('各居室・食堂・居住区通路及び操舵室の床面にはラテックス系デッキコンポジションを6mm厚さに塗装する。浴室・シャワー室・便所・洗濯室・賄室の床面はタイル張りとする。'),
    emptyP(),
  );

  // (11)〜(12) 固定文
  children.push(
    h2('(11)　冷蔵装置'),
    para('賄室に家庭用電気冷凍冷蔵庫320Ｌ ２台、食堂に320Ｌ １台、船長・機関長室100Ｌ（4室）・船員室47Ｌ（4室）小型冷蔵庫47Ｌ型を設ける。（ＡＣ 100Ｖ）取付けバンドはＳＵＳとする。'),
    emptyP(),
    h2('(12)　船内通信装置'),
    new Table({width:{size:CW,type:WidthType.DXA}, columnWidths:[3000,4500,2246], rows:[
      new TableRow({children:[hCell('機器名称',3000),hCell('型式・仕様',4500),hCell('設置箇所',2246)]}),
      new TableRow({children:[lCell('エンジンテレグラフ（コンソール組込）',3000),mkCell('非常用として電気式エンジンテレグラフ１組を設ける。電源はＤＣ２４Ｖ。',{w:4500}),mkCell('操舵室・機関室',{w:2246})]}),
      new TableRow({children:[lCell('船内電話装置',3000),mkCell('電源はＤＣ２４Ｖ。詳細は電気部仕様書による。',{w:4500}),mkCell('電気部仕様書による',{w:2246})]}),
      new TableRow({children:[lCell('拡声装置',3000),mkCell('トークバック方式',{w:4500}),mkCell('操舵室・船首尾楼',{w:2246})]}),
      new TableRow({children:[lCell('その他',3000),mkCell('詳細は電気部仕様書による。',{w:4500}),mkCell('',{w:2246})]}),
    ]}),
    emptyP(),
  );

  // (13) 通風
  children.push(
    h2('(13)　通風採光装置'),
    new Table({width:{size:CW,type:WidthType.DXA}, columnWidths:[2800,2500,2500,1946], rows:[
      new TableRow({children:[hCell('施工場所',2800),hCell('型式',2500),hCell('容量及び数',2500),hCell('メーカー',1946)]}),
      ...formRowsToTableRows(d.ventRows||[],[2800,2500,2500,1946]),
    ]}),
    emptyP(),
  );

  // (14) 照明
  children.push(
    h2('(14)　照明装置'),
    new Table({width:{size:CW,type:WidthType.DXA}, columnWidths:[2000,2500,1000,1500,2746], rows:[
      new TableRow({children:[hCell('項目',2000),hCell('設置箇所',2500),hCell('数',1000),hCell('容量',1500),hCell('備考',2746)]}),
      ...formRowsToTableRows(d.lightRows||[],[2000,2500,1000,1500,2746]),
      new TableRow({children:[new TableCell({columnSpan:5,borders:BD,margins:{top:60,bottom:60,left:100,right:100},children:[new Paragraph({children:[new TextRun({text:'居住区等その他の設備は電気部仕様書による。',font:FONT,size:18})]})]})]})
    ]}),
    emptyP(),
  );

  // (15) 冷暖房
  children.push(
    h2('(15)　冷暖房装置'),
    para('家庭用セパレートマルチエアコンを操舵室、食堂及び事務室、サロン、各居室に室内機を設備し冷温風を送風する。空冷室外機を船橋甲板及び端艇甲板上に設備する。'),
    new Table({width:{size:CW,type:WidthType.DXA}, columnWidths:[3000,6746], rows:[
      row2('空冷式室外機', vd(d.ac_outdoor), 3000, 6746),
      row2('室内機', vd(d.ac_indoor), 3000, 6746),
    ]}),
    emptyP(),
  );

  // (16) 諸管装置（固定文）
  children.push(
    h2('(16)　諸管装置'),
    new Table({width:{size:CW,type:WidthType.DXA}, columnWidths:[2500,7246], rows:[
      row2('ビルジ管系統','甲板長倉庫・錨鎖庫のビルジはエダクター（80A）により船外に排出する。舵機室のビルジはウイングポンプにて吸引し船外に導く。ポンプ室のビルジは荷役装置による。'),
      row2('サニタリー管系統','清水を利用する。'),
      row2('測深管','各タンクに測深管を設け、管頭部には黄鋼製口金ねじ込みキャップを、底部には当金をそれぞれ取付ける。貨物油槽用の管頭部は自動閉鎖とする。'),
      row2('空気抜管','各タンクに規定の高さに達するよう配管し、油タンクの空気管頭にはボンネット型を取付ける。'),
      row2('送油管','燃料油張込管及びバルブは船尾楼甲板上に設け、各タンクに張込みできるよう配管し、両端に盲板を設ける。'),
      row2('清水管','清水ホームポンプ（200V）は２台（１台予備）とし、圧力タンクより賄室・浴室・シャワー室・洗濯室・便所・各洗面所・操舵室等に供給する。'),
      row2('排水管','暴露甲板上の必要箇所に排水孔を設ける。賄室・浴室等の排水は各舷の排水集合管に導き船外に排出する。満載吃水線下に排出口を設け波止弁を設ける。'),
      row2('汚物管','各便器からは汚物管を通じ船外に排出し、外板出口には波止弁を設ける。'),
      row2('消防兼甲板洗浄管','上甲板及び端艇甲板に所要の消火栓を配置し、消防兼雑用水ポンプ及びビルジバラストポンプより配管する。'),
      row2('油圧管','揚錨機・パワークレーンは甲板長倉庫内の油圧ポンプユニット、係船機は舵機室内の油圧ポンプユニットにより駆動する。暴露部のパイプはＳＵＳ３０４。'),
      row2('温水管','電気温水器より浴室・賄室・洗面器・洗濯室・シャワー室等に導く。'),
      row2('空気管','上甲板上船首から船尾までエアースプレー用として施工する。'),
    ]}),
    emptyP(),
  );

  // (17) 消火装置
  children.push(
    h2('(17)　消火装置'),
    new Table({width:{size:CW,type:WidthType.DXA}, columnWidths:[2200,6000,1546], rows:[
      new TableRow({children:[hCell('区画',2200),hCell('消火装置種別・機器',6000),hCell('備考',1546)]}),
      new TableRow({children:[lCell('機関室',2200),mkCell('消火栓、持運式粉末及び泡消火器、移動式粉末消火器装置（23㎏）、ＣＯ₂消火装置、泡放射器',{w:6000}),mkCell('',{w:1546})]}),
      new TableRow({children:[lCell('ポンプ室',2200),mkCell('ＣＯ₂消火装置、持運式泡消火器',{w:6000}),mkCell('',{w:1546})]}),
      new TableRow({children:[lCell('貨物区域',2200),mkCell('固定式甲板泡装置（300Ｌ）、消火栓、持運式粉末消火器',{w:6000}),mkCell('甲板泡消火装置',{w:1546})]}),
      new TableRow({children:[lCell('居住区画',2200),mkCell('消火栓、持運式粉末消火器',{w:6000}),mkCell('',{w:1546})]}),
      new TableRow({children:[lCell('その他の場所',2200),mkCell('消火栓、持運式泡消火器',{w:6000}),mkCell('',{w:1546})]}),
    ]}),
    emptyP(),
    new Table({width:{size:CW,type:WidthType.DXA}, columnWidths:[3000,1800,1000,2500,1446], rows:[
      new TableRow({children:[hCell('名称',3000),hCell('容量',1800),hCell('数',1000),hCell('設置場所',2500),hCell('備考',1446)]}),
      ...formRowsToTableRows(d.fireRows||[],[3000,1800,1000,2500,1446]),
    ]}),
    emptyP(),
    new Table({width:{size:CW,type:WidthType.DXA}, columnWidths:[3500,2000,1000,3246], rows:[
      new TableRow({children:[hCell('名称',3500),hCell('型式',2000),hCell('数',1000),hCell('設置場所',3246)]}),
      ...formRowsToTableRows(d.gasRows||[],[3500,2000,1000,3246]),
    ]}),
    emptyP(),
  );

  // (18) 倉庫（固定）
  children.push(
    h2('(18)　倉庫及び倉庫内設備'),
    new Table({width:{size:CW,type:WidthType.DXA}, columnWidths:[1800,1400,1100,1100,1100,1100,1100,946], rows:[
      new TableRow({children:[hCell('名称',1800),hCell('位置',1400),hCell('床',1100),hCell('壁',1100),hCell('天井',1100),hCell('開閉装置',1100),hCell('棚',1100),hCell('備考',946)]}),
      new TableRow({children:[lCell('甲板長倉庫',1800),mkCell('船首楼内',{w:1400}),mkCell('ペイント仕上',{w:1100}),mkCell('同左',{w:1100}),mkCell('同左',{w:1100}),mkCell('鋼製風雨密蓋',{w:1100}),mkCell('棚',{w:1100}),mkCell('',{w:946})]}),
      new TableRow({children:[lCell('船首甲板倉庫',1800),mkCell('船首楼内',{w:1400}),mkCell('〃',{w:1100}),mkCell('〃',{w:1100}),mkCell('〃',{w:1100}),mkCell('鋼製風雨密蓋',{w:1100}),mkCell('〃',{w:1100}),mkCell('',{w:946})]}),
      new TableRow({children:[lCell('舵機室',1800),mkCell('船尾楼内',{w:1400}),mkCell('〃',{w:1100}),mkCell('〃',{w:1100}),mkCell('〃',{w:1100}),mkCell('〃',{w:1100}),mkCell('〃',{w:1100}),mkCell('',{w:946})]}),
    ]}),
    emptyP(),
  );

  // (19) 救命設備
  children.push(
    h2('(19)　救命設備等'),
    new Table({width:{size:CW,type:WidthType.DXA}, columnWidths:[2200,2000,1800,800,1000,1946], rows:[
      new TableRow({children:[hCell('名称',2200),hCell('材質・型式',2000),hCell('要目',1800),hCell('数',800),hCell('',1000),hCell('備考',1946)]}),
      ...formRowsToTableRows(d.seikyRows||[],[2200,2000,1800,800,1000,1946]),
    ]}),
    emptyP(),
    para('※ 火災制御図：船尾楼甲板上暴露両舷にケースに入れ設置する。',{sz:18}),
    emptyP(),
  );

  // (20) 階段（固定文）
  children.push(
    h2('(20)　階段・スタンション・グレーチング及びストームレール等'),
    h3('■ 鋼製傾斜梯子'),
    new Table({width:{size:CW,type:WidthType.DXA}, columnWidths:[2200,2200,800,1200,1800,1546], rows:[
      new TableRow({children:[hCell('区分',2200),hCell('位置',2200),hCell('数',800),hCell('巾',1200),hCell('ハンドレール',1800),hCell('備考',1546)]}),
      new TableRow({children:[new TableCell({columnSpan:6,borders:BD,margins:{top:60,bottom:60,left:100,right:100},children:[new Paragraph({children:[new TextRun({text:'鋼製傾斜梯子',font:FONT,size:18,bold:true})]})]}),]}),
      ...emptyRows(14,[2200,2200,800,1200,1800,1546]),
      new TableRow({children:[new TableCell({columnSpan:6,borders:BD,margins:{top:60,bottom:60,left:100,right:100},children:[new Paragraph({children:[new TextRun({text:'鋼製直立梯子',font:FONT,size:18,bold:true})]})]}),]}),
      ...emptyRows(6,[2200,2200,800,1200,1800,1546]),
    ]}),
    emptyP(),
    h3('■ ハンドレール・スタンション'),
    new Table({width:{size:CW,type:WidthType.DXA}, columnWidths:[2500,1800,1500,1500,1000,1446], rows:[
      new TableRow({children:[hCell('区分',2500),hCell('位置',1800),hCell('トップレール',1500),hCell('スタンション',1500),hCell('横棒',1000),hCell('備考',1446)]}),
      new TableRow({children:[new TableCell({columnSpan:6,borders:BD,margins:{top:60,bottom:60,left:100,right:100},children:[new Paragraph({children:[new TextRun({text:'ハンドレール',font:FONT,size:18,bold:true})]})]}),]}),
      ...emptyRows(2,[2500,1800,1500,1500,1000,1446]),
      new TableRow({children:[new TableCell({columnSpan:6,borders:BD,margins:{top:60,bottom:60,left:100,right:100},children:[new Paragraph({children:[new TextRun({text:'スタンション（亜鉛メッキ）',font:FONT,size:18,bold:true})]})]}),]}),
      ...emptyRows(8,[2500,1800,1500,1500,1000,1446]),
    ]}),
    emptyP(),
    new Table({width:{size:CW,type:WidthType.DXA}, columnWidths:[3000,6746], rows:[
      row2('ワーフラダー','',3000,6746),
      row2('グレーチング','',3000,6746),
      row2('ストームレール','',3000,6746),
    ]}),
    emptyP(),
  );

  // (21) 塗装（固定）
  children.push(
    h2('(21)　塗装'),
    para('※ 鋼材表面処理：船殻鋼材は全てショットプライマー施工材料を使用し、加熱部・錆部等は塗装前にサンダー等により完全に除去する。',{sz:18}),
    new Table({width:{size:CW,type:WidthType.DXA}, columnWidths:[2800,2000,2000,1000,1946], rows:[
      new TableRow({children:[hCell('塗装箇所',2800),hCell('下塗・塗料（回数・膜厚）',2000),hCell('仕上塗料（回数・膜厚）',2000),hCell('回数',1000),hCell('メーカー・備考',1946)]}),
      ...['外板　船側部','外板　水線部・船底部','船首（内面）','船首（外面）',
          '甲板　上甲板暴露部','甲板　甲板機械台下','甲板　機関室囲壁頂部・甲板室頂部',
          '貨物油槽（全面）','ポンプ室　床下','ポンプ室　床上',
          '甲板室及び囲壁　外面','甲板室及び囲壁　内張のない箇所','甲板室及び囲壁　内張のある箇所',
          'ブルワーク　内面','マスト及び通風筒　内面','マスト及び通風筒　外面',
          '煙突　内面','煙突　外面','甲板上艤装品　亜鉛メッキ部','甲板上艤装品　その他',
          '錨鎖庫　天井・壁・床','機関室　天井及び壁','機関室　内底板上面及び補機台','機関室　補機台下・下部壁・底部',
          'タンク　清水槽','タンク　ＦＰＴ・船首深水槽・二重底バラスト水槽','タンク　燃料油槽・潤滑油槽',
          'ビルジ溜り　内面','ＣＯ₂室　天井・壁','ＣＯ₂室　床','諸倉庫　天井・壁','諸倉庫　床','舵機室　天井・壁','舵機室　床',
        ].map(n=>new TableRow({children:[lCell(n,2800),...[2000,2000,1000,1946].map(w=>mkCell('',{w}))]})),
    ]}),
    emptyP(),
  );

  // (22)〜(24)
  children.push(
    h2('(22)　甲板舗装'),
    new Table({width:{size:CW,type:WidthType.DXA}, columnWidths:[2500,2500,2500,2246], rows:[
      new TableRow({children:[hCell('項目',2500),hCell('種類',2500),hCell('施工場所',2500),hCell('備考',2246)]}),
      new TableRow({children:[lCell('セメント上タイル',2500),mkCell('',{w:2500}),mkCell('便所・浴室・洗濯室・脱衣場・シャワー室',{w:2500}),mkCell('',{w:2246})]}),
      new TableRow({children:[lCell('デッキコンポジション',2500),mkCell('6mm ラテックス系',{w:2500}),mkCell('各居室・食堂・操舵室・居住区内通路',{w:2500}),mkCell('',{w:2246})]}),
    ]}),
    emptyP(),
    h2('(23)　帆布類'),
    new Table({width:{size:CW,type:WidthType.DXA}, columnWidths:[2500,2500,2500,2246], rows:[
      new TableRow({children:[hCell('項目',2500),hCell('種類',2500),hCell('施工場所',2500),hCell('備考',2246)]}),
      new TableRow({children:[lCell('各種カバー',2500),mkCell('暴露部　キャンバス',{w:2500}),mkCell('各航海用機器・バルブカバー・レピーター・クレーン・通風筒・停泊機・荷受け操作部・オーニング',{w:2500}),mkCell('',{w:2246})]}),
    ]}),
    emptyP(),
    h2('(24)　保護亜鉛板'),
    new Table({width:{size:CW,type:WidthType.DXA}, columnWidths:[3500,6246], rows:[
      row2('船舶防食装置', vd(d.zinc_main), 3500, 6246),
      row2('海洋生物付着防止装置', vd(d.zinc_bio), 3500, 6246),
    ]}),
    emptyP(),
  );

  // (25) 航海機器
  children.push(
    h2('(25)　航海機器'),
    new Table({width:{size:CW,type:WidthType.DXA}, columnWidths:[2800,1200,2800,2946], rows:[
      new TableRow({children:[hCell('品名',2800),hCell('数量',1200),hCell('型式・適用',2800),hCell('メーカー・備考',2946)]}),
      ...formRowsToTableRows(d.navRows||[],[2800,1200,2800,2946]),
    ]}),
    emptyP(),
  );

  // (26) 属具
  children.push(
    h2('(26)　属具及び備品'),
    new Table({width:{size:CW,type:WidthType.DXA}, columnWidths:[2500,1200,3000,3046], rows:[
      new TableRow({children:[hCell('品名',2500),hCell('数量',1200),hCell('適用',3000),hCell('備考',3046)]}),
      ...formRowsToTableRows(d.zokuRows||[],[2500,1200,3000,3046]),
    ]}),
    emptyP(),
  );

  // (27)〜(28)
  children.push(
    h2('(27)　標示等'),
    para('船名及び船籍港名は鋼板切抜き製とする。'),
    para('乾舷マークは乾舷計算に基づいたものを標示する。'),
    para('吃水マークは船体中央・船首・船尾部に標示する（鋼板切抜き製）。'),
    para('その他船主の要求する諸表示及び名板を設ける。'),
    emptyP(),
    h2('(28)　図書目録'),
    new Table({width:{size:CW,type:WidthType.DXA}, columnWidths:[4000,1000,1000,1200,1200,1346], rows:[
      new TableRow({children:[
        hCell('図面及び図面名称',4000),
        hCell('JG承認図',1000), hCell('船主承認図',1000),
        hCell('船主完成図',1200), hCell('本船完成図',1200), hCell('参考図',1346),
      ]}),
      ...['船体部建造仕様書','完成船舶要目表','一般配置図','排水量等曲線図','容量図',
          '計画重量重心計算書','総トン数計算書','乾舷計算書','載貨重量計算書',
          '速力馬力曲線図及び計算書','海上試運転実施方案','海上試運転成績表',
          '中央断面図','鋼材構造図','外板展開図','船尾骨材図','溶接施工要領',
          '舵構造図','構造部材計算書','機関台構造図',
          '二重底構造図 1/3','二重底構造図 2/3','二重底構造図 3/3',
          '上甲板構造図 1/3','上甲板構造図 2/3','上甲板構造図 3/3',
          '機関室構造図','船首構造図','船首楼構造図','船尾構造図','船尾楼構造図',
          '端艇甲板構造図','上部構造図','甲板艤装図','甲板諸管系統図','荷役管系統図',
          '諸室装置図','操舵装置図','係船装置図','完成復原性資料','損傷時復原性計算書',
          '諸タンク容量テーブル','貨物槽容量テーブル（検定協会）','塗装要領図',
          '放射線透過箇所配置図','消防救命設備配置図',
        ].map(name=>new TableRow({children:[lCell(name,4000),...[1000,1000,1200,1200,1346].map(w=>mkCell('',{w,center:true}))]})),
    ]}),
    emptyP(),
    emptyP(),
    para(`${vd(d.shipyard,'鈴木造船株式会社')}`,{right:true}),
    para('以上',{right:true, bold:true}),
  );

  // Document生成
  const doc = new Document({
    styles:{
      default:{document:{run:{font:FONT,size:20}}},
      paragraphStyles:[
        {id:'Heading1',name:'Heading 1',basedOn:'Normal',next:'Normal',quickFormat:true,run:{size:28,bold:true,font:FONT},paragraph:{spacing:{before:280,after:140},outlineLevel:0}},
        {id:'Heading2',name:'Heading 2',basedOn:'Normal',next:'Normal',quickFormat:true,run:{size:24,bold:true,font:FONT},paragraph:{spacing:{before:200,after:100},outlineLevel:1}},
        {id:'Heading3',name:'Heading 3',basedOn:'Normal',next:'Normal',quickFormat:true,run:{size:20,bold:true,font:FONT},paragraph:{spacing:{before:140,after:60},outlineLevel:2}},
      ]
    },
    sections:[{
      properties:{page:{size:{width:PAGE_W,height:PAGE_H},margin:{top:MARGIN,bottom:MARGIN,left:MARGIN,right:MARGIN}}},
      footers:{default:new Footer({children:[new Paragraph({
        alignment:AlignmentType.RIGHT,
        children:[
          new TextRun({text:`${vd(d.ship_name,'　')} `, font:FONT, size:16}),
          new TextRun({children:[PageNumber.CURRENT], font:FONT, size:16}),
          new TextRun({text:' / ', font:FONT, size:16}),
          new TextRun({children:[PageNumber.TOTAL_PAGES], font:FONT, size:16}),
        ]
      })]})},
      children,
    }],
  });
  return Packer.toBuffer(doc);
}

module.exports = {generateWord};
