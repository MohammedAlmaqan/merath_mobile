const REPORTS_KEY = 'merath:reports:v1';

export type SavedReport = {
  id: string;
  path: string;
  name: string;
  madhab: string;
  type: 'pdf' | 'csv';
  createdAt: number;
};

export function generateReportHTML(result: any, madhabKey: string) {
  // Attempt to get madhab name from FIQH_DATABASE dynamically; fall back to key
  let madhabName = madhabKey;
  try {
    // dynamic require to avoid bundler errors in native tests
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const db = require('./inheritance-calculator').FIQH_DATABASE;
    if (db && db.madhabs && db.madhabs[madhabKey]) madhabName = db.madhabs[madhabKey].name || madhabKey;
  } catch (e) {
    // fallback
    madhabName = madhabKey;
  }
  const rows = result.shares
    .map((s: any) => `
      <tr>
        <td style="padding:8px;border:1px solid #ddd">${s.name}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:center">${s.count}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:center">${s.fraction.toString()}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:right">${s.amount.toFixed(2)}</td>
      </tr>`)
    .join('\n');

  return `
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>body{font-family:Arial,Helvetica,sans-serif;direction:rtl;text-align:right} table{border-collapse:collapse;width:100%}</style>
      </head>
      <body>
        <h2>نتيجة حساب المواريث - ${madhabName}</h2>
        <p><strong>التركة الصافية:</strong> ${result.netEstate.toFixed(2)} ريال</p>
        <p><strong>أصل المسألة:</strong> ${result.finalBase}</p>
        <p><strong>مستوى الثقة:</strong> ${result.confidence ? Math.round(result.confidence * 100) + '%' : 'N/A'}</p>
        <h3>تفصيل الأنصبة</h3>
        <table>
          <thead>
            <tr>
              <th style="padding:8px;border:1px solid #ddd">الوارث</th>
              <th style="padding:8px;border:1px solid #ddd">العدد</th>
              <th style="padding:8px;border:1px solid #ddd">النصيب</th>
              <th style="padding:8px;border:1px solid #ddd">المبلغ</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        <hr/>
        <p>مولّد بواسطة تطبيق مرث (Merath) - الجوال</p>
      </body>
      </html>
    `;
}

export function generateCSV(result: any) {
  const header = ['heir,count,share,amount'];
  const rows = result.shares.map((s: any) =>
    `${JSON.stringify(s.name)},${s.count},${JSON.stringify(s.fraction.toString())},${s.amount.toFixed(2)}`
  );
  return header.concat(rows).join('\n');
}

export async function saveFile(content: string, ext: string, prefix = 'merath-report') {
  const filename = `${prefix}-${Date.now()}.${ext}`;
  const FileSystem = await import('expo-file-system');
  const path = `${FileSystem.documentDirectory}${filename}`;
  // write file
  // @ts-ignore
  await FileSystem.writeAsStringAsync(path, content, { encoding: FileSystem.EncodingType.UTF8 });
  return path;
}

export async function saveReportMetadata(meta: Omit<SavedReport, 'id' | 'createdAt'>) {
  const AsyncStorage = await import('@react-native-async-storage/async-storage');
  const listRaw = await AsyncStorage.getItem(REPORTS_KEY);
  const list: SavedReport[] = listRaw ? JSON.parse(listRaw) : [];
  const entry: SavedReport = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: Date.now(),
    ...meta,
  } as SavedReport;
  list.unshift(entry);
  await AsyncStorage.setItem(REPORTS_KEY, JSON.stringify(list));
  return entry;
}

export async function getSavedReports(): Promise<SavedReport[]> {
  const AsyncStorage = await import('@react-native-async-storage/async-storage');
  const raw = await AsyncStorage.getItem(REPORTS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function deleteSavedReport(id: string) {
  const AsyncStorage = await import('@react-native-async-storage/async-storage');
  const FileSystem = await import('expo-file-system');
  const raw = await AsyncStorage.getItem(REPORTS_KEY);
  const list: SavedReport[] = raw ? JSON.parse(raw) : [];
  const idx = list.findIndex(r => r.id === id);
  if (idx !== -1) {
    const [entry] = list.splice(idx, 1);
    try {
      // @ts-ignore
      await FileSystem.deleteAsync(entry.path, { idempotent: true });
    } catch (e) {
      // ignore
    }
    await AsyncStorage.setItem(REPORTS_KEY, JSON.stringify(list));
    return true;
  }
  return false;
}
