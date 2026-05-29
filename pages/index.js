import { useState, useCallback } from 'react';

// ===== スタイル定義 =====
const S = {
  header: { background:'#0d1b2a', color:'#fff', position:'sticky', top:0, zIndex:100, borderBottom:'2px solid #c9a84c', padding:'12px 28px', display:'flex', alignItems:'center', justifyContent:'space-between' },
  logoMark: { width:40, height:40, background:'#c9a84c', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:18, color:'#0d1b2a', marginRight:14 },
  layout: { display:'grid', gridTemplateColumns:'220px 1fr', minHeight:'calc(100vh - 68px)' },
  sidebar: { background:'#1b2d42', padding:'16px 0', position:'sticky', top:68, height:'calc(100vh - 68px)', overflowY:'auto' },
  sitem: (active) => ({ display:'block', padding:'8px 16px', color: active ? '#4a90c4' : '#8faacc', cursor:'pointer', fontSize:12, borderLeft: active ? '3px solid #4a90c4' : '3px solid transparent', background: active ? 'rgba(74,144,196,.15)' : 'transparent', transition:'all .15s' }),
  main: { padding:'24px 32px', maxWidth:1100 },
  secH: { fontSize:19, fontWeight:700, color:'#0d1b2a', borderBottom:'2px solid #2c4a6e', paddingBottom:8, marginBottom:6, display:'flex', alignItems:'center', gap:10 },
  num: { background:'#2c4a6e', color:'#fff', width:26, height:26, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700 },
  card: { background:'#fff', border:'1px solid #ccd9e8', borderRadius:8, marginBottom:16 },
  cardHd: { background:'#e8f0f8', padding:'9px 16px', fontWeight:700, fontSize:13, color:'#1b2d42', borderBottom:'1px solid #ccd9e8', display:'flex', alignItems:'center', gap:8 },
  cardBody: { padding:16 },
  row: { display:'grid', gap:12, marginBottom:12 },
  fg: { display:'flex', flexDirection:'column', gap:3 },
  label: { fontSize:10, fontWeight:700, color:'#5a7290', letterSpacing:'.05em', textTransform:'uppercase' },
  input: { border:'1px solid #ccd9e8', borderRadius:5, padding:'7px 10px', fontSize:12, fontFamily:'inherit', color:'#1a2535', background:'#fafcff', outline:'none' },
  textarea: { border:'1px solid #ccd9e8', borderRadius:5, padding:'7px 10px', fontSize:12, fontFamily:'inherit', color:'#1a2535', background:'#fafcff', outline:'none', resize:'vertical', minHeight:60 },
  select: { border:'1px solid #ccd9e8', borderRadius:5, padding:'7px 10px', fontSize:12, fontFamily:'inherit', color:'#1a2535', background:'#fafcff', outline:'none' },
  etbl: { width:'100%', borderCollapse:'collapse', fontSize:12, marginBottom:6 },
  th: { background:'#eaf0f8', border:'1px solid #b0c4d8', padding:'6px 8px', fontWeight:700, color:'#1b2d42', textAlign:'center' },
  td: { border:'1px solid #c8d8e8', padding:2 },
  tinput: { width:'100%', border:'none', padding:'5px 6px', fontSize:11, fontFamily:'inherit', background:'transparent', outline:'none' },
  srTd: { border:'1px solid #c8d8e8', padding:'5px 8px', background:'#0d1b2a', color:'#fff', fontWeight:700, fontSize:11 },
  totTd: { border:'1px solid #c8d8e8', padding:'5px 8px', background:'#e8f4ec', fontWeight:700, fontSize:11 },
  addBtn: { background:'none', border:'1px dashed #ccd9e8', color:'#5a7290', padding:'4px 12px', borderRadius:4, cursor:'pointer', fontSize:11, fontFamily:'inherit', marginRight:6 },
  navAct: { display:'flex', justifyContent:'space-between', marginTop:14, marginBottom:80 },
  btnNav: { background:'#fff', border:'1px solid #ccd9e8', padding:'8px 20px', borderRadius:6, cursor:'pointer', fontFamily:'inherit', fontSize:12, color:'#2c4a6e' },
  bbar: { position:'fixed', bottom:0, left:0, right:0, background:'#0d1b2a', borderTop:'2px solid #c9a84c', padding:'11px 28px', display:'flex', alignItems:'center', justifyContent:'space-between', zIndex:100 },
  btnGen: (loading) => ({ background: loading ? '#a07820' : '#c9a84c', color:'#0d1b2a', border:'none', padding:'10px 26px', borderRadius:6, fontWeight:700, fontSize:13, fontFamily:'inherit', cursor: loading ? 'not-allowed' : 'pointer' }),
  toast: (show, err) => ({ position:'fixed', top:80, right:20, background: err ? '#c0392b' : '#2e7d52', color:'#fff', padding:'10px 16px', borderRadius:8, fontSize:12, fontWeight:700, opacity: show ? 1 : 0, transition:'all .3s', zIndex:200, pointerEvents:'none' }),
  note: { background:'#fff8e6', border:'1px solid #f0d060', borderLeft:'4px solid #c9a84c', borderRadius:4, padding:'7px 12px', fontSize:11, color:'#7a6020', marginBottom:12 },
};

const SECS = ['表紙','一般計画','保証事項','主要要目','各部の仕様①','各部の仕様②','各部の仕様③','確認・生成'];

// ===== 編集可テーブルコンポーネント =====
function EditTable({ cols, rows, onRowsChange, sectionable }) {
  const addRow = (type='normal') => onRowsChange([...rows, { type, cells: cols.map(() => '') }]);
  const delRow = (i) => onRowsChange(rows.filter((_,idx) => idx !== i));
  const setCell = (ri, ci, v) => {
    const next = rows.map((r,idx) => idx===ri ? {...r, cells: r.cells.map((c,ci2) => ci2===ci ? v : c)} : r);
    onRowsChange(next);
  };
  const setSecLabel = (ri, v) => {
    const next = rows.map((r,idx) => idx===ri ? {...r, label:v} : r);
    onRowsChange(next);
  };
  return (
    <div>
      <table style={S.etbl}>
        <thead><tr>{cols.map(c=><th key={c} style={S.th}>{c}</th>)}<th style={{...S.th,width:32}}></th></tr></thead>
        <tbody>
          {rows.map((row,ri) => row.type==='section' ? (
            <tr key={ri}>
              <td colSpan={cols.length} style={S.srTd}>
                <input style={{...S.tinput, color:'#fff', background:'transparent', fontWeight:700}} value={row.label||''} onChange={e=>setSecLabel(ri,e.target.value)} />
              </td>
              <td style={{...S.td, textAlign:'center'}}><button style={{background:'none',border:'none',cursor:'pointer',color:'#cc4444',fontSize:13}} onClick={()=>delRow(ri)}>✕</button></td>
            </tr>
          ) : row.type==='total' ? (
            <tr key={ri}>
              {(row.cells||[]).map((c,ci)=><td key={ci} style={{...S.td, background:'#e8f4ec', padding:0}}><input style={{...S.tinput, fontWeight:700}} value={c} onChange={e=>setCell(ri,ci,e.target.value)} /></td>)}
              <td style={{...S.td, textAlign:'center'}}><button style={{background:'none',border:'none',cursor:'pointer',color:'#cc4444',fontSize:13}} onClick={()=>delRow(ri)}>✕</button></td>
            </tr>
          ) : (
            <tr key={ri}>
              {(row.cells||[]).map((c,ci)=><td key={ci} style={S.td}><input style={S.tinput} value={c} onChange={e=>setCell(ri,ci,e.target.value)} /></td>)}
              <td style={{...S.td, textAlign:'center'}}><button style={{background:'none',border:'none',cursor:'pointer',color:'#cc4444',fontSize:13}} onClick={()=>delRow(ri)}>✕</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <button style={S.addBtn} onClick={()=>addRow('normal')}>＋ 行追加</button>
        {sectionable && <><button style={{...S.addBtn, borderColor:'#888', color:'#555'}} onClick={()=>addRow('section')}>＋ 見出し行</button>
        <button style={{...S.addBtn, borderColor:'#2e7d52', color:'#2e7d52'}} onClick={()=>addRow('total')}>＋ 合計行</button></>}
      </div>
    </div>
  );
}

function FG({ label, children }) {
  return <div style={S.fg}><label style={S.label}>{label}</label>{children}</div>;
}
function Input({ id, value, onChange, placeholder }) {
  return <input id={id} style={S.input} value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder||''} />;
}
function Sel({ value, onChange, options }) {
  return <select style={S.select} value={value||''} onChange={e=>onChange(e.target.value)}>{options.map(o=><option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}</select>;
}
function TA({ value, onChange, placeholder, rows=3 }) {
  return <textarea style={S.textarea} rows={rows} value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder||''} />;
}
function Card({ title, children }) {
  return <div style={S.card}><div style={S.cardHd}><span style={{width:4,height:14,background:'#4a90c4',borderRadius:2,display:'inline-block',marginRight:4}}></span>{title}</div><div style={S.cardBody}>{children}</div></div>;
}
function Row({ cols=2, children }) {
  return <div style={{...S.row, gridTemplateColumns: Array(cols).fill('1fr').join(' ')}}>{children}</div>;
}

// ===== メインページ =====
export default function Home() {
  const [cur, setCur] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show:false, msg:'', err:false });
  const showToast = (msg, err=false) => { setToast({show:true,msg,err}); setTimeout(()=>setToast(t=>({...t,show:false})),4000); };

  // ===== フォームデータ =====
  const [d, setD] = useState({
    // 表紙
    ship_name:'', ship_type:'油タンカー', ship_type_custom:'', project_no:'', create_date:'', rev_no:'Rev.1', shipyard:'鈴木造船株式会社',
    // 一般計画
    nav_area:'沿海区域（日本沿岸）', purpose:'タンカー', cargo:'ガソリン・灯油・軽油',
    dwt_s:'', cargo_vol_s:'', hull_type:'船首楼・船尾楼付一層甲板船尾機関型', speed_s:'',
    plan_lpp:'', plan_b:'', plan_d:'', plan_draft:'',
    plan_speed_detail:'主機出力８５％負荷、１５％シーマージン',
    plan_engine_detail:'',
    plan_body_desc:'本船は十分なる復原性と良好なる推進性能及び操縦性能に留意し、油タンカー本来の使命に合致した経済船を目的として、仕様書細部に至る迄検討を加えて本船就航の上に高位な採算性を確保し得るものとする。',
    // 保証事項
    gvol:'', gspeed:'',
    // 主要要目
    use:'', hull_d:'', navc:'沿海　第４種船', ship_class:'ＪＧ', reg:'国内船舶関係法規、ＯＣＩＭＦ－ＳＩＲＥ',
    etype:'単動４サイクル過給機インタークーラー付ディーゼル機関', emkr:'', emdl:'', ekw:'', ekw_ps:'', ekw_rpm:'', ekw85:'', ekw85_ps:'', ekw85_rpm:'',
    fuel:'Ａ重油', spd:'', spd_detail:'主機出力85%、15%シーマージン', rng:'',
    tel:'', lan:'操舵室、事務室・サロン兼食堂にＬＡＮケーブルを敷設する。', radio:'詳細は電気部仕様書によるものとする。',
    crew_d_name:'船長・一等航海士', crew_d:'２',
    crew_e_name:'機関長・一等機関士', crew_e:'２',
    crew_da_name:'甲板員', crew_da:'１',
    crew_ea_name:'機関員', crew_ea:'２',
    crew_other:'１', crew_max:'８',
    // 操舵装置
    rtype:'電動油圧式', rknm:'', rmot_v:'４４０', rmot_kw:'５．５', rmot_num:'２',
    rmkr:'東京計器㈱', auto:'ＧＣＰを装備し、自動にて操舵可能とする。舵機室内にて操作可能とする。',
    btype:'', bthrust:'', bthrust_blade:'', bmot:'',
    // 荷役装置
    pump_mkr:'サンコーエンジニアリング㈱', pump_type:'スクリュー式', pump_num:'２',
    pump_vol:'', pump_press:'', pump_ps:'', pump_rpm:'',
    pump_struct:'軸封オイルシール（接液部バイトン）',
    pump_mat:'ケーシング：FC200、ローター：CAC402、シャフト：SUS403',
    pump_drive:'主機駆動（２台同時運転可能）、高弾性継手エアークラッチ及び増速機を経てポンプを発停する。',
    // 冷暖房
    ac_outdoor:'', ac_indoor:'',
    // 保護亜鉛板
    zinc_main:'船尾骨材・舵・ビルジキール・海水吸入箱・二重底サクション付近に必要数取り付ける。海水こしきに亜鉛を付ける。',
    zinc_bio:'電極式を設備する（コンヒラ）',
  });
  const set = (k) => (v) => setD(prev => ({...prev, [k]:v}));

  // 編集テーブル
  const initDimRows = [
    {type:'normal',cells:['全長（LOA）','','m','約']},
    {type:'normal',cells:['垂線間長（Lpp）','','m','']},
    {type:'normal',cells:['幅（型）','','m','']},
    {type:'normal',cells:['深さ（型）','','m','']},
    {type:'normal',cells:['計画満載吃水（型）','','m','']},
    {type:'normal',cells:['構造吃水（型）','','m','']},
    {type:'normal',cells:['甲板間高：上甲板〜船首楼甲板','','m','']},
    {type:'normal',cells:['甲板間高：上甲板〜船尾楼甲板','','m','']},
    {type:'normal',cells:['甲板間高：船尾楼甲板〜端艇甲板','','m','']},
    {type:'normal',cells:['甲板間高：端艇甲板〜船橋甲板','','m','']},
    {type:'normal',cells:['甲板間高：航海船橋甲板〜羅針儀甲板','','m','']},
    {type:'normal',cells:['舷弧（前部・後部）','','m','FP・APにて']},
    {type:'normal',cells:['梁矢（上甲板）','','m','']},
    {type:'normal',cells:['梁矢（船楼及び船橋甲板）','','m','']},
    {type:'normal',cells:['方形肥せき係数（Cb）','','','']},
    {type:'normal',cells:['総トン数','','トン','']},
    {type:'normal',cells:['排水量（満載）','','トン','']},
    {type:'normal',cells:['軽荷排水量','','トン','']},
    {type:'normal',cells:['載貨重量（DWT）','','トン','']},
  ];
  const initTankRows = [
    {type:'section',label:'貨物油槽（COT）'},
    {type:'normal',cells:['ＮＯ．１ＣＯＴ（Ｐ／Ｓ）','','Ｐ／Ｓ','']},
    {type:'normal',cells:['ＮＯ．２ＣＯＴ（Ｐ／Ｓ）','','Ｐ／Ｓ','']},
    {type:'normal',cells:['ＮＯ．３ＣＯＴ（Ｐ／Ｓ）','','Ｐ／Ｓ','']},
    {type:'normal',cells:['ＮＯ．４ＣＯＴ（Ｐ／Ｓ）','','Ｐ／Ｓ','']},
    {type:'normal',cells:['ＮＯ．５ＣＯＴ（Ｐ／Ｓ）','','Ｐ／Ｓ','']},
    {type:'total',cells:['合計','','㎥','']},
    {type:'section',label:'燃料油タンク（FOT）'},
    {type:'normal',cells:['ＮＯ．１ＦＯＴ（Ｃ）Ａ重油','','','']},
    {type:'normal',cells:['ＮＯ．２ＦＯＴ（Ｐ／Ｓ）Ａ重油','','','']},
    {type:'total',cells:['合計','','㎥','']},
    {type:'section',label:'清水タンク（FWT）'},
    {type:'normal',cells:['ＦＷＴ（Ｃ）','','','']},
    {type:'section',label:'バラスト・海水タンク（WBT）'},
    {type:'normal',cells:['ＦＰＴ（Ｃ）船首水槽','','','']},
    {type:'normal',cells:['ＮＯ．１ＷＢＴ（Ｃ）','','','']},
    {type:'normal',cells:['ＮＯ．２ＷＢＴ（Ｐ／Ｓ）','','','']},
    {type:'normal',cells:['ＮＯ．３ＷＢＴ（Ｐ／Ｓ）','','','']},
    {type:'normal',cells:['ＮＯ．４ＷＢＴ（Ｐ／Ｓ）','','','']},
    {type:'normal',cells:['ＮＯ．５ＷＢＴ（Ｐ／Ｓ）','','','']},
    {type:'total',cells:['合計','','㎥','']},
    {type:'section',label:'廃油タンク・その他'},
    {type:'normal',cells:['ＬＯＳＴ（Ｃ）廃油タンク','','㎥','']},
    {type:'normal',cells:['ＳＬＵＤＧＥ（Ｃ）スラッジ','','㎥','']},
    {type:'normal',cells:['ＣＷＴ（Ｐ＆Ｓ）','','㎥','']},
  ];
  const initOpenRows  = [{type:'normal',cells:['船首楼甲板','角ハッチ','700×700','1','鋼製水密蓋','縁材の高さは規定の高さを満足する']},{type:'normal',cells:['','マイクボックス','650×650','1','鋼製水密蓋','']},{type:'normal',cells:['上甲板','錨鎖庫ハッチ','600×600','2','ボルテッドハッチ','']},{type:'normal',cells:['','オイルタイトハッチ','760φ','10','鋼製水密蓋','上甲板上のハッチ類']},{type:'normal',cells:['（予備行）','','','','','']},{type:'normal',cells:['（予備行）','','','','','']}];
  const initMastRows  = [{type:'normal',cells:['前部マスト','船首楼甲板','１','鋼管製','ランプ台、ステー','リギンワイヤー及び機器']},{type:'normal',cells:['ベントポスト','トランク上','６','鋼管製','ランプ台、ステー','ボルト・ナット・タンバックル・アイピースはＳＵＳ']},{type:'normal',cells:['レーダーマスト','羅針儀甲板','１','鋼管製','レーダー台・ランプ台・プラットフォーム・ステー','']},{type:'normal',cells:['船尾灯マスト','端艇甲板','１','鋼管製','ランプ台','']}];
  const initAnchRows  = [{type:'normal',cells:['揚錨機','船首上甲板','２','電動油圧式（分離型）','チェーンホイル 38㎜φ×1 6/3T × 12/24m/min','ブレーキテスト出来る構造']},{type:'normal',cells:['係船機','船尾楼甲板','２','電動油圧式','ホーサードラム×2 50㎜φ×200m巻','']},{type:'normal',cells:['油圧ポンプユニット（揚錨機用）','甲板長倉庫','1','可変容量型','37KW × 4P','揚錨機駆動用']},{type:'normal',cells:['油圧ポンプユニット（係船機用）','舵機室','1','可変容量型','30KW × 4P','係船機駆動用']}];
  const initKeisenpRows = [{type:'section',label:'係船機具'},{type:'normal',cells:['船首楼甲板','ボラード','２','250φ','ＳＵＳ製','']},{type:'normal',cells:['','フェアリーダー（3ローラー）','２','200φ','鋳鉄製','']},{type:'normal',cells:['','制鎖器','２','38φ','','ローラー式']},{type:'normal',cells:['船尾楼甲板','ボラード','２','250φ','ＳＵＳ製','']},{type:'normal',cells:['上甲板','ボラード','４','250φ','ＳＵＳ製','']},{type:'normal',cells:['','ビット','２','100φ','銅製','両舷']}];
  const initValveRows = [{type:'normal',cells:['仕切弁','ＦＣ','ＢＣ','10㎏/㎠']},{type:'normal',cells:['バタフライ弁','ＦＣ','要部ＳＵＳ＋バイトン','10㎏/㎠']},{type:'normal',cells:['玉形弁','ＦＣ','ＢＣ','10㎏/㎠']},{type:'normal',cells:['マニホールド部','ＦＣ','ＢＣ','10㎏/㎠']}];
  const initPumpRows  = [{type:'normal',cells:['バラストポンプ','']},{type:'normal',cells:['残油ポンプ','']},{type:'normal',cells:['ダイヤフラムポンプ（残油回収）','']},{type:'normal',cells:['ガスフリーターボファン','']},{type:'normal',cells:['ポンプ室排風機','']},{type:'normal',cells:['パワークレーン（ホース吊り）','']},{type:'normal',cells:['ローデイングコンピューター','']},{type:'normal',cells:['液面監視装置','']},{type:'normal',cells:['温度監視装置','']},{type:'normal',cells:['漏油回収ポータブルポンプ','']}];
  const initVentRows  = [{type:'normal',cells:['機関室','電動軸流内装可逆式','','広瀬鉄工㈱']},{type:'normal',cells:['居住区','電動軸流内装可逆式','','〃']},{type:'normal',cells:['ポンプ室','シロッコファン（吸気のみ）','','〃']},{type:'normal',cells:['貨物油槽','軸貫通ターボファン','','〃']},{type:'normal',cells:['バウスラスター室','電動軸流内装（吸気のみ）','','〃']},{type:'normal',cells:['舵機室','電動軸流内装可逆式','','〃']},{type:'normal',cells:['賄室','換気扇','','〃']},{type:'normal',cells:['ＣＯ₂室','電動軸流内装（排気のみ）','','〃']},{type:'normal',cells:['浴室・シャワー室','パイプファン（排気のみ）','','〃']},{type:'normal',cells:['便所','〃','','〃']}];
  const initLightRows = [{type:'normal',cells:['荷役灯','船首マスト','２','500W（ＬＥＤ）','']},{type:'normal',cells:['','羅針儀甲板','２','500W（ＬＥＤ）','']},{type:'normal',cells:['投光器','機関室','２','300W（ＬＥＤ）','']},{type:'normal',cells:['深照灯','羅針儀甲板','１','1,000W（ハロゲン灯）','']},{type:'normal',cells:['作業灯','船首マスト','１','300W（ＬＥＤ）','']},{type:'normal',cells:['救命筏灯','端艇甲板','１','75W（シールドビーム）','']},{type:'normal',cells:['海図台灯','操舵室内','１','40W','光度加減器付']}];
  const initFireRows  = [{type:'normal',cells:['消防兼ビルジポンプ','100/40㎥/H×20/60m','２','機関室','']},{type:'normal',cells:['消火栓','40φ','９','上甲板×3・船首楼×1・船尾楼×2・機関室×2・端艇甲板×1','']},{type:'normal',cells:['消火ホース','40φ','５','甲板×3・機関室×2','甲板20m・機関室15m']},{type:'normal',cells:['消火ノズル','40φ','５','甲板×3・機関室×2','']},{type:'normal',cells:['持運式粉末消火器5kg','5.0㎏','９','操舵室×1・機関室×3・ポンプ室×1・居住区通路×2・船首倉庫×1・舵機室×1','']},{type:'normal',cells:['持運式粉末消火器6kg','6.0㎏','２','膨張トランク上','']}];
  const initGasRows   = [{type:'normal',cells:['引火性ガス検知器（固定式）','拡散式','１','機関室']},{type:'normal',cells:['引火性ガス検知器（固定式）','拡散式','１','ポンプ室']},{type:'normal',cells:['引火性ガス検知器（固定式）','拡散式','２','船尾楼甲板上（拡散式）']},{type:'normal',cells:['ポータブル酸素濃度計','メンテナンスキット付','２','']},{type:'normal',cells:['硫化水素検知器','可搬式','１','']},{type:'normal',cells:['ポータブルガス検知器','可搬式（メンテナンスキット付）','２','']},{type:'normal',cells:['火災感知器','','','操舵室・機関室・賄室・食堂・各甲板通路']}];
  const initSeikyuRows= [{type:'normal',cells:['救命筏','膨張式','タンカー用（15人用）','１','']},{type:'normal',cells:['救命浮環','ＦＲＰ製','','４','航海船橋甲板2個']},{type:'normal',cells:['救命胴衣','固形式','','８','船名記入']},{type:'normal',cells:['消防員装具','','','2組','']},{type:'section',label:'信号装置'},{type:'normal',cells:['落下傘付信号','','4本入り','１','']},{type:'normal',cells:['自己発煙信号','','','２','']},{type:'normal',cells:['火せん','','2本入り','１','']},{type:'normal',cells:['自己点火灯','','電池式','２','']},{type:'section',label:'ＧＭＤＳＳ'},{type:'normal',cells:['双方向無線電話装置','','','３','古野電気㈱']},{type:'normal',cells:['レーダートランスポンダ','','','１','〃']},{type:'normal',cells:['衛星ＥＰＩＲＢ','','','１','〃']},{type:'normal',cells:['国際ＶＨＦ無線電話装置','','','１','〃']},{type:'normal',cells:['ＮＡＶＴＥＸ','','','１','〃']}];
  const initNavRows   = [{type:'normal',cells:['反射式磁気コンパス','１','','大航計器']},{type:'normal',cells:['サテライトコンパス','１','ＳＣ－７０','古野電気㈱']},{type:'normal',cells:['ジャイロコンパス','１','','東京計器']},{type:'normal',cells:['自動舵取機','１','ＧＣＰ','東京計器']},{type:'normal',cells:['Ｎｏ.１レーダー','１','ＦＡＲ－２０２８－ＭＡＲＫ２','古野電気㈱']},{type:'normal',cells:['Ｎｏ.２レーダー','１','ＦＡＲ－２０２８－ＭＡＲＫ２－ＢＢ','古野電気㈱']},{type:'normal',cells:['ＤＧＰＳ航法装置','１','ＧＰ－１７０','古野電気㈱']},{type:'normal',cells:['電子海図','１','','']},{type:'normal',cells:['真風向風速計','１','ＦＷ－２５０','アネオス']},{type:'normal',cells:['スピードログ','１','ＤＳ－８５','古野電気㈱']},{type:'normal',cells:['音響測深機','１','ＦＥ－８００','古野電気㈱']},{type:'normal',cells:['ＡＩＳ','１','ＦＡ－１７０','古野電気㈱']},{type:'normal',cells:['防爆トランシーバー','８','ＨＸ６００ＵＦＪＩＳ','古野電気㈱']},{type:'normal',cells:['ＥＰＩＲＢ','１','Ｔｒｏｎ６０ＡＩＳ','古野電気㈱']}];
  const initZokuguRows= [{type:'section',label:'錨・錨鎖'},{type:'normal',cells:['大錨','２','単重 約1,600㎏×2','高把駐力錨 ＡＣ-14']},{type:'normal',cells:['大錨鎖','１','38φ×450m　電接２種スタッド付メッキ','ジョイニングシャックル（開先を付ける）']},{type:'normal',cells:['係船索','１','50φ×200m　コンビロープ','']},{type:'section',label:'航海用具'},{type:'normal',cells:['舶用時計','13','操舵室・食堂・機関室・娯楽室・サロン・各居室','電池式']},{type:'normal',cells:['双眼鏡','１','50㎜×7倍（7.3度）ニコン製','']},{type:'section',label:'船灯・信号器具'},{type:'normal',cells:['マスト灯','２','ＬＥＤ 第１種２灯式','']},{type:'normal',cells:['舷灯','1対','ＬＥＤ 第１種２灯式','']},{type:'normal',cells:['号鐘','１','300㎜','']},{type:'section',label:'甲板長倉庫品'},{type:'normal',cells:['チッピングハンマー','４','300㎜','']},{type:'normal',cells:['タンクスケール（油用）','１','10m','']},{type:'section',label:'備品類'},{type:'normal',cells:['ホワイトボード','３','操舵室・食堂・機関室','アルミ製']},{type:'normal',cells:['歩み板','１','','アルミ製']}];

  const [dimRows,   setDimRows]   = useState(initDimRows);
  const [tankRows,  setTankRows]  = useState(initTankRows);
  const [openRows,  setOpenRows]  = useState(initOpenRows);
  const [mastRows,  setMastRows]  = useState(initMastRows);
  const [anchRows,  setAnchRows]  = useState(initAnchRows);
  const [keisRows,  setKeisRows]  = useState(initKeisenpRows);
  const [valvRows,  setValvRows]  = useState(initValveRows);
  const [pumpRows,  setPumpRows]  = useState(initPumpRows);
  const [ventRows,  setVentRows]  = useState(initVentRows);
  const [lightRows, setLightRows] = useState(initLightRows);
  const [fireRows,  setFireRows]  = useState(initFireRows);
  const [gasRows,   setGasRows]   = useState(initGasRows);
  const [seikyRows, setSeikyRows] = useState(initSeikyuRows);
  const [navRows,   setNavRows]   = useState(initNavRows);
  const [zokuRows,  setZokuRows]  = useState(initZokuguRows);

  const goto = (n) => { setCur(n); window.scrollTo(0,0); };

  // ===== Word生成 =====
  const generate = async () => {
    setLoading(true);
    showToast('⏳ Word仕様書を生成しています...');
    const shipType = d.ship_type === 'other' ? d.ship_type_custom : d.ship_type;
    const payload = {
      ...d, ship_type: shipType,
      dimRows, tankRows, openRows, mastRows, anchRows,
      keisRows, valvRows, pumpRows, ventRows, lightRows,
      fireRows, gasRows, seikyRows, navRows, zokuRows,
    };
    try {
      const res = await fetch('/api/generate', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `船体部仕様書_${d.ship_name||'新造船'}.docx`; a.click();
      URL.revokeObjectURL(url);
      showToast('✅ Wordファイルを生成しました！');
    } catch(e) { showToast('❌ '+e.message, true); }
    finally { setLoading(false); }
  };

  // ===== レンダリング =====
  return (
    <>
      <div style={S.toast(toast.show, toast.err)}>{toast.msg}</div>
      <header style={S.header}>
        <div style={{display:'flex',alignItems:'center'}}>
          <div style={S.logoMark}>鈴</div>
          <div>
            <div style={{fontSize:15,fontWeight:700,letterSpacing:'.1em'}}>鈴木造船株式会社</div>
            <div style={{fontSize:10,color:'#8faacc',letterSpacing:'.15em'}}>船体部仕様書作成システム</div>
          </div>
        </div>
      </header>

      <div style={S.layout}>
        {/* サイドバー */}
        <aside style={S.sidebar}>
          <div style={{fontSize:9,color:'#5a7a9a',padding:'0 14px 8px',letterSpacing:'.2em',textTransform:'uppercase',borderBottom:'1px solid rgba(255,255,255,.06)',marginBottom:4}}>章一覧</div>
          {SECS.map((s,i)=><div key={i} style={S.sitem(cur===i)} onClick={()=>goto(i)}>{s}</div>)}
        </aside>

        <main style={S.main}>

          {/* ===== 0: 表紙 ===== */}
          {cur===0 && <div>
            <div style={S.secH}><span style={S.num}>表</span>表紙情報</div>
            <p style={{fontSize:11,color:'#5a7290',marginBottom:16}}>仕様書表紙に記載する基本情報を入力してください。</p>
            <Card title="基本情報">
              <Row><FG label="船名"><Input value={d.ship_name} onChange={set('ship_name')} placeholder="例：第○○鈴木丸" /></FG>
              <FG label="船種"><Sel value={d.ship_type} onChange={set('ship_type')} options={['油タンカー','ケミカルタンカー','液体化学薬品ばら積船 兼 油タンカー','貨物船',{v:'other',l:'その他（直接入力）'}]} /></FG></Row>
              {d.ship_type==='other' && <Row><FG label="船種（直接入力）"><Input value={d.ship_type_custom} onChange={set('ship_type_custom')} placeholder="船種を入力" /></FG><div /></Row>}
              <Row><FG label="工事番号"><Input value={d.project_no} onChange={set('project_no')} placeholder="例：S-823" /></FG>
              <FG label="作成日"><input type="date" style={S.input} value={d.create_date||''} onChange={e=>set('create_date')(e.target.value)} /></FG></Row>
              <Row><FG label="改訂番号"><Input value={d.rev_no} onChange={set('rev_no')} /></FG>
              <FG label="造船所名"><Input value={d.shipyard} onChange={set('shipyard')} /></FG></Row>
            </Card>
            <div style={S.navAct}><div /><button style={S.btnNav} onClick={()=>goto(1)}>次へ →</button></div>
          </div>}

          {/* ===== 1: 一般計画 ===== */}
          {cur===1 && <div>
            <div style={S.secH}><span style={S.num}>１</span>一般計画</div>
            <Card title="(1) 航行区域及び就航予定航路">
              <Row cols={1}><FG label="航行区域"><Sel value={d.nav_area} onChange={set('nav_area')} options={['沿海区域（日本沿岸）','近海区域','平水区域','限定沿海区域']} /></FG></Row>
            </Card>
            <Card title="(2) 用途及び予定貨物">
              <Row><FG label="用途"><Input value={d.purpose} onChange={set('purpose')} placeholder="例：タンカー" /></FG>
              <FG label="予定貨物"><Input value={d.cargo} onChange={set('cargo')} placeholder="例：ガソリン・灯油・軽油" /></FG></Row>
            </Card>
            <Card title="(3) 本船計画の基本方針">
              <Row><FG label="載貨重量（トン）"><Input value={d.dwt_s} onChange={set('dwt_s')} placeholder="例：１，８６０" /></FG>
              <FG label="載貨容積（m³）"><Input value={d.cargo_vol_s} onChange={set('cargo_vol_s')} placeholder="例：２，２００" /></FG></Row>
              <Row><FG label="船型（概略）"><Input value={d.hull_type} onChange={set('hull_type')} placeholder="例：船首楼・船尾楼付一層甲板船　船尾機関型" /></FG>
              <FG label="満載航海速力（ノット）"><Input value={d.speed_s} onChange={set('speed_s')} placeholder="例：10.5" /></FG></Row>
              <Row><FG label="主要寸法　Lpp（m）"><Input value={d.plan_lpp} onChange={set('plan_lpp')} placeholder="例：66.80" /></FG>
              <FG label="幅（型）B（m）"><Input value={d.plan_b} onChange={set('plan_b')} placeholder="例：11.80" /></FG></Row>
              <Row><FG label="深さ（型）D（m）"><Input value={d.plan_d} onChange={set('plan_d')} placeholder="例：5.20" /></FG>
              <FG label="計画満載吃水（型）d（m）"><Input value={d.plan_draft} onChange={set('plan_draft')} placeholder="例：4.750" /></FG></Row>
              <Row><FG label="速力条件詳細"><Input value={d.plan_speed_detail} onChange={set('plan_speed_detail')} placeholder="例：主機出力８５％負荷、１５％シーマージン" /></FG>
              <FG label="主機関詳細（一般計画記載用）"><Input value={d.plan_engine_detail} onChange={set('plan_engine_detail')} placeholder="例：単動４サイクル…メーカー：㈱赤阪鉄工所　ＡＸ３３ＢＲ　１４７１ＫＷ" /></FG></Row>
              <Row cols={1}><FG label="本船計画の基本方針（本文追記）"><TA value={d.plan_body_desc} onChange={set('plan_body_desc')} /></FG></Row>
            </Card>
            <div style={S.navAct}><button style={S.btnNav} onClick={()=>goto(0)}>← 前へ</button><button style={S.btnNav} onClick={()=>goto(2)}>次へ →</button></div>
          </div>}

          {/* ===== 2: 保証事項 ===== */}
          {cur===2 && <div>
            <div style={S.secH}><span style={S.num}>２</span>保証事項等</div>
            <Card title="(1) 保証事項">
              <Row><FG label="貨物容積（m³以上）"><Input value={d.gvol} onChange={set('gvol')} placeholder="例：２１８０" /></FG>
              <FG label="試運転最高速力の条件"><Input value={d.gspeed} onChange={set('gspeed')} placeholder="例：主機関連続最大回転数２８０ｍｉｎ⁻¹、満載状態にて１１．００ノット" /></FG></Row>
            </Card>
            <div style={S.navAct}><button style={S.btnNav} onClick={()=>goto(1)}>← 前へ</button><button style={S.btnNav} onClick={()=>goto(3)}>次へ →</button></div>
          </div>}

          {/* ===== 3: 主要要目 ===== */}
          {cur===3 && <div>
            <div style={S.secH}><span style={S.num}>３</span>主要要目等</div>
            <Card title="(1)(2) 用途・船型・船級">
              <Row><FG label="用途"><Input value={d.use} onChange={set('use')} placeholder="例：油タンカー" /></FG>
              <FG label="船型詳細"><Input value={d.hull_d} onChange={set('hull_d')} placeholder="例：船首楼・船尾楼付一層甲板船、船尾機関型、バルバス型船首、トランサム型船尾、二重底" /></FG></Row>
              <Row><FG label="航行区域・種別"><Input value={d.navc} onChange={set('navc')} /></FG>
              <FG label="船級"><Input value={d.ship_class} onChange={set('ship_class')} /></FG></Row>
              <Row cols={1}><FG label="適用法規"><Input value={d.reg} onChange={set('reg')} /></FG></Row>
            </Card>
            <Card title="■ 船体主要寸法（行の追加・削除・項目名変更可）">
              <div style={S.note}>項目名セルも直接編集できます。</div>
              <EditTable cols={['寸法項目','計画値','単位','備考']} rows={dimRows} onRowsChange={setDimRows} />
            </Card>
            <Card title="■ タンク容量一覧（行の追加・削除・見出し行・合計行追加可）">
              <EditTable cols={['タンク名称','容量（m³）','区画','備考']} rows={tankRows} onRowsChange={setTankRows} sectionable />
            </Card>
            <Card title="(4) 主機関">
              <Row><FG label="主機関種別"><Input value={d.etype} onChange={set('etype')} /></FG>
              <FG label="メーカー"><Input value={d.emkr} onChange={set('emkr')} placeholder="例：㈱赤阪鉄工所" /></FG></Row>
              <Row><FG label="型式"><Input value={d.emdl} onChange={set('emdl')} placeholder="例：ＡＸ３３ＢＲ" /></FG>
              <FG label="使用燃料"><Input value={d.fuel} onChange={set('fuel')} /></FG></Row>
              <Row cols={3}><FG label="連続最大出力（KW）"><Input value={d.ekw} onChange={set('ekw')} placeholder="例：1,471" /></FG>
              <FG label="同（PS）"><Input value={d.ekw_ps} onChange={set('ekw_ps')} placeholder="例：2,000" /></FG>
              <FG label="回転数（min⁻¹）"><Input value={d.ekw_rpm} onChange={set('ekw_rpm')} placeholder="例：280" /></FG></Row>
              <Row cols={3}><FG label="常用出力・85%（KW）"><Input value={d.ekw85} onChange={set('ekw85')} placeholder="例：1,250" /></FG>
              <FG label="同（PS）"><Input value={d.ekw85_ps} onChange={set('ekw85_ps')} placeholder="例：1,700" /></FG>
              <FG label="回転数（min⁻¹）"><Input value={d.ekw85_rpm} onChange={set('ekw85_rpm')} placeholder="例：265" /></FG></Row>
            </Card>
            <Card title="(5)(6)(7) 速力・無線・乗組員">
              <Row><FG label="満載航海速力（ノット）"><Input value={d.spd} onChange={set('spd')} placeholder="例：10.5" /></FG>
              <FG label="速力条件"><Input value={d.spd_detail} onChange={set('spd_detail')} /></FG></Row>
              <Row><FG label="航続距離（海里）"><Input value={d.rng} onChange={set('rng')} placeholder="例：約3,000" /></FG>
              <FG label="電話・FAX"><Input value={d.tel} onChange={set('tel')} placeholder="例：送受話器は事務室（親機）・操舵室・船長室（子機）にＦＡＸを操舵室に設ける。（船主支給）" /></FG></Row>
              <Row><FG label="ＬＡＮ配線"><Input value={d.lan} onChange={set('lan')} /></FG>
              <FG label="その他無線機器"><Input value={d.radio} onChange={set('radio')} /></FG></Row>
              <Row cols={3}><FG label="職員（甲板部）職名"><Input value={d.crew_d_name} onChange={set('crew_d_name')} /></FG>
              <FG label="人数"><Input value={d.crew_d} onChange={set('crew_d')} /></FG><div /></Row>
              <Row cols={3}><FG label="職員（機関部）職名"><Input value={d.crew_e_name} onChange={set('crew_e_name')} /></FG>
              <FG label="人数"><Input value={d.crew_e} onChange={set('crew_e')} /></FG><div /></Row>
              <Row cols={3}><FG label="部員（甲板部）職名"><Input value={d.crew_da_name} onChange={set('crew_da_name')} /></FG>
              <FG label="人数"><Input value={d.crew_da} onChange={set('crew_da')} /></FG><div /></Row>
              <Row cols={3}><FG label="部員（機関部）職名"><Input value={d.crew_ea_name} onChange={set('crew_ea_name')} /></FG>
              <FG label="人数"><Input value={d.crew_ea} onChange={set('crew_ea')} /></FG><div /></Row>
              <Row><FG label="その他の者（人数）"><Input value={d.crew_other} onChange={set('crew_other')} /></FG>
              <FG label="最大搭載人員"><Input value={d.crew_max} onChange={set('crew_max')} /></FG></Row>
            </Card>
            <div style={S.navAct}><button style={S.btnNav} onClick={()=>goto(2)}>← 前へ</button><button style={S.btnNav} onClick={()=>goto(4)}>次へ →</button></div>
          </div>}

          {/* ===== 4: 各部の仕様① ===== */}
          {cur===4 && <div>
            <div style={S.secH}><span style={S.num}>４①</span>各部の仕様（開口・マスト・揚錨・操舵・荷役）</div>
            <Card title="(5) 開口閉鎖装置">
              <EditTable cols={['位置','名称','寸法及び数','数','材質・閉鎖方式','備考']} rows={openRows} onRowsChange={setOpenRows} />
            </Card>
            <Card title="(6) マスト及びデリックポスト">
              <EditTable cols={['項目','位置','数','材質','付属物','備考']} rows={mastRows} onRowsChange={setMastRows} />
            </Card>
            <Card title="(7) 揚錨及び係船器具">
              <EditTable cols={['項目','位置','数','型式','力量等','備考']} rows={anchRows} onRowsChange={setAnchRows} />
              <div style={{height:12}} />
              <div style={{fontWeight:700,fontSize:12,color:'#1b2d42',marginBottom:6}}>■ 係船器具明細</div>
              <EditTable cols={['区分','取付位置','名称','数','寸法','材質','備考']} rows={keisRows} onRowsChange={setKeisRows} sectionable />
            </Card>
            <Card title="(8) 操舵装置">
              <Row><FG label="操舵装置型式"><Input value={d.rtype} onChange={set('rtype')} /></FG>
              <FG label="トルク（ＫＮｍ）"><Input value={d.rknm} onChange={set('rknm')} placeholder="例：８３．３" /></FG></Row>
              <Row cols={3}><FG label="電動機電圧（Ｖ）"><Input value={d.rmot_v} onChange={set('rmot_v')} /></FG>
              <FG label="電動機出力（ＫＷ）"><Input value={d.rmot_kw} onChange={set('rmot_kw')} /></FG>
              <FG label="電動機台数"><Input value={d.rmot_num} onChange={set('rmot_num')} /></FG></Row>
              <Row><FG label="メーカー"><Input value={d.rmkr} onChange={set('rmkr')} /></FG>
              <FG label="自動操舵"><Input value={d.auto} onChange={set('auto')} /></FG></Row>
              <Row><FG label="バウスラスター型式（型番）"><Input value={d.btype} onChange={set('btype')} placeholder="例：ＴＣ－１００Ｎ（かもめプロペラ㈱）" /></FG>
              <FG label="バウスラスター推力"><Input value={d.bthrust} onChange={set('bthrust')} placeholder="例：３．４Ｔ" /></FG></Row>
              <Row><FG label="翼・直径"><Input value={d.bthrust_blade} onChange={set('bthrust_blade')} placeholder="例：４翼可変ピッチ　１０２０φ" /></FG>
              <FG label="バウスラスター電動機"><Input value={d.bmot} onChange={set('bmot')} placeholder="例：４４０Ｖ × ２０５ＫＷ × ４Ｐ × ６０Ｈｚ" /></FG></Row>
            </Card>
            <Card title="(9) 荷役装置 ■ 貨物油ポンプ">
              <Row cols={3}><FG label="メーカー"><Input value={d.pump_mkr} onChange={set('pump_mkr')} /></FG>
              <FG label="型式"><Input value={d.pump_type} onChange={set('pump_type')} /></FG>
              <FG label="台数"><Input value={d.pump_num} onChange={set('pump_num')} /></FG></Row>
              <Row cols={2}><FG label="容量（m³/H）"><Input value={d.pump_vol} onChange={set('pump_vol')} placeholder="例：750" /></FG>
              <FG label="圧力（MPaG）"><Input value={d.pump_press} onChange={set('pump_press')} placeholder="例：0.78" /></FG></Row>
              <Row cols={2}><FG label="PS"><Input value={d.pump_ps} onChange={set('pump_ps')} placeholder="例：390" /></FG>
              <FG label="回転数（min⁻¹）"><Input value={d.pump_rpm} onChange={set('pump_rpm')} placeholder="例：1,160" /></FG></Row>
              <Row cols={1}><FG label="構造"><Input value={d.pump_struct} onChange={set('pump_struct')} /></FG></Row>
              <Row cols={1}><FG label="材質"><Input value={d.pump_mat} onChange={set('pump_mat')} /></FG></Row>
              <Row cols={1}><FG label="駆動方式"><TA value={d.pump_drive} onChange={set('pump_drive')} rows={2} /></FG></Row>
              <div style={{fontWeight:700,fontSize:12,color:'#1b2d42',margin:'12px 0 6px'}}>■ バルブ材質</div>
              <EditTable cols={['種別','本体（弁箱）','弁体','圧力']} rows={valvRows} onRowsChange={setValvRows} />
              <div style={{fontWeight:700,fontSize:12,color:'#1b2d42',margin:'12px 0 6px'}}>■ 荷役関連ポンプ等</div>
              <EditTable cols={['機器名称','仕様・メーカー']} rows={pumpRows} onRowsChange={setPumpRows} />
            </Card>
            <div style={S.navAct}><button style={S.btnNav} onClick={()=>goto(3)}>← 前へ</button><button style={S.btnNav} onClick={()=>goto(5)}>次へ →</button></div>
          </div>}

          {/* ===== 5: 各部の仕様② ===== */}
          {cur===5 && <div>
            <div style={S.secH}><span style={S.num}>４②</span>各部の仕様（居住区・通風・照明・諸管・消火・倉庫）</div>
            <Card title="(13) 通風採光装置">
              <EditTable cols={['施工場所','型式','容量及び数','メーカー']} rows={ventRows} onRowsChange={setVentRows} />
            </Card>
            <Card title="(14) 照明装置">
              <EditTable cols={['項目','設置箇所','数','容量','備考']} rows={lightRows} onRowsChange={setLightRows} />
            </Card>
            <Card title="(15) 冷暖房装置">
              <Row><FG label="空冷式室外機（台数・仕様）"><Input value={d.ac_outdoor} onChange={set('ac_outdoor')} placeholder="例：４台" /></FG>
              <FG label="室内機（台数・設置箇所）"><Input value={d.ac_indoor} onChange={set('ac_indoor')} placeholder="例：１２台（操舵室、食堂、事務室、サロン、各居室）" /></FG></Row>
            </Card>
            <Card title="(17) 消火装置 ■ 消火機器一覧">
              <EditTable cols={['名称','容量','数','設置場所','備考']} rows={fireRows} onRowsChange={setFireRows} />
              <div style={{fontWeight:700,fontSize:12,color:'#1b2d42',margin:'12px 0 6px'}}>■ ガス検知器・感知器</div>
              <EditTable cols={['名称','型式','数','設置場所']} rows={gasRows} onRowsChange={setGasRows} />
            </Card>
            <Card title="(24) 保護亜鉛板">
              <Row cols={1}><FG label="船舶防食装置"><TA value={d.zinc_main} onChange={set('zinc_main')} rows={2} /></FG></Row>
              <Row cols={1}><FG label="海洋生物付着防止装置"><Input value={d.zinc_bio} onChange={set('zinc_bio')} /></FG></Row>
            </Card>
            <div style={S.navAct}><button style={S.btnNav} onClick={()=>goto(4)}>← 前へ</button><button style={S.btnNav} onClick={()=>goto(6)}>次へ →</button></div>
          </div>}

          {/* ===== 6: 各部の仕様③ ===== */}
          {cur===6 && <div>
            <div style={S.secH}><span style={S.num}>４③</span>各部の仕様（救命設備・航海機器・属具備品）</div>
            <Card title="(19) 救命設備等">
              <div style={S.note}>救命設備・信号装置・GMDSSを一括管理。見出し行で区切られています。</div>
              <EditTable cols={['名称','材質・型式','要目','数','備考']} rows={seikyRows} onRowsChange={setSeikyRows} sectionable />
            </Card>
            <Card title="(25) 航海機器">
              <EditTable cols={['品名','数量','型式・適用','メーカー・備考']} rows={navRows} onRowsChange={setNavRows} />
            </Card>
            <Card title="(26) 属具及び備品">
              <div style={S.note}>錨・錨鎖、航海用具、船灯、信号旗、倉庫品、備品を一括管理。見出し行で区切れます。</div>
              <EditTable cols={['品名','数量','適用','備考']} rows={zokuRows} onRowsChange={setZokuRows} sectionable />
            </Card>
            <div style={S.navAct}><button style={S.btnNav} onClick={()=>goto(5)}>← 前へ</button><button style={S.btnNav} onClick={()=>goto(7)}>確認・生成 →</button></div>
          </div>}

          {/* ===== 7: 確認・生成 ===== */}
          {cur===7 && <div>
            <div style={S.secH}><span style={S.num}>✓</span>確認・Word生成</div>
            <Card title="入力サマリー">
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                <tbody>
                  {[['船名',d.ship_name||'（未入力）'],['工事番号',d.project_no||'（未入力）'],['船種',d.ship_type==='other'?d.ship_type_custom:d.ship_type],['主機メーカー',d.emkr||'（未入力）'],['型式',d.emdl||'（未入力）'],['連続最大出力',d.ekw?`${d.ekw}KW`:'（未入力）'],['満載速力',d.spd?`${d.spd}ノット`:'（未入力）']].map(([k,v],i)=>(
                    <tr key={k} style={{background:i%2?'#fff':'#f4f7fb'}}>
                      <td style={{padding:'7px 12px',fontWeight:700,width:'40%',border:'1px solid #dde'}}>{k}</td>
                      <td style={{padding:'7px 12px',border:'1px solid #dde'}}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
            <div style={{textAlign:'center',margin:'28px 0 12px'}}>
              <button style={{...S.btnGen(loading), fontSize:15, padding:'14px 44px', display:'inline-flex', alignItems:'center', gap:8}} onClick={generate} disabled={loading}>
                {loading ? '⏳ 生成中...' : '📄 Word仕様書を生成・ダウンロード'}
              </button>
              <p style={{marginTop:10,fontSize:11,color:'#888'}}>ボタンを押すと自動でダウンロードが始まります</p>
            </div>
            <div style={S.navAct}><button style={S.btnNav} onClick={()=>goto(6)}>← 前へ</button><div /></div>
          </div>}

        </main>
      </div>

      {/* ボトムバー */}
      <div style={S.bbar}>
        <div style={{color:'#8faacc',fontSize:12}}>{SECS[cur]} — {cur+1}/{SECS.length}</div>
        <div style={{flex:1,maxWidth:240,height:4,background:'rgba(255,255,255,.1)',borderRadius:2,margin:'0 14px'}}>
          <div style={{width:`${Math.round((cur+1)/SECS.length*100)}%`,height:'100%',background:'#c9a84c',borderRadius:2,transition:'width .3s'}} />
        </div>
        <button style={S.btnGen(loading)} onClick={generate} disabled={loading}>📄 Word生成</button>
      </div>
    </>
  );
}
