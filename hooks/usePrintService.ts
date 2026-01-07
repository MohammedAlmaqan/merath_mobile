import { useState, useCallback } from 'react';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import { CalculationResult, EstateData, HeirsData } from '@/lib/inheritance-calculator';
import { generatePDFContent, PDFReportData } from '@/lib/pdf-generator';

export interface PrintOptions {
  orientation?: 'portrait' | 'landscape';
  includeHeader?: boolean;
  includeFooter?: boolean;
}

export function usePrintService() {
  const [isPrinting, setIsPrinting] = useState(false);
  const [printError, setPrintError] = useState<string | null>(null);

  const generatePDFHTML = useCallback(
    (
      madhab: string,
      madhhabName: string,
      estate: EstateData,
      heirs: HeirsData,
      result: CalculationResult
    ): string => {
      const reportData: PDFReportData = {
        madhab,
        madhhabName,
        date: new Date().toLocaleString('ar-SA'),
        estate,
        heirs,
        result,
      };

      return generatePDFContent(reportData);
    },
    []
  );

  const printPDF = useCallback(
    async (
      madhab: string,
      madhhabName: string,
      estate: EstateData,
      heirs: HeirsData,
      result: CalculationResult,
      options: PrintOptions = {}
    ) => {
      try {
        setIsPrinting(true);
        setPrintError(null);

        const htmlContent = generatePDFHTML(madhab, madhhabName, estate, heirs, result);

        // Printing is available on most devices

        // Print
        await Print.printAsync({
          html: htmlContent,
          printerUrl: undefined,
          orientation: options.orientation === 'landscape' ? Print.Orientation.landscape : Print.Orientation.portrait,
        });

        Alert.alert('نجح', 'تم إرسال التقرير إلى الطابعة بنجاح');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'حدث خطأ في الطباعة';
        setPrintError(errorMessage);
        Alert.alert('خطأ', `فشل في الطباعة: ${errorMessage}`);
        console.error('Print error:', error);
      } finally {
        setIsPrinting(false);
      }
    },
    [generatePDFHTML]
  );

  const savePDFToFile = useCallback(
    async (
      madhab: string,
      madhhabName: string,
      estate: EstateData,
      heirs: HeirsData,
      result: CalculationResult
    ) => {
      try {
        setIsPrinting(true);
        setPrintError(null);

        const htmlContent = generatePDFHTML(madhab, madhhabName, estate, heirs, result);

        // Generate PDF
        const { uri } = await Print.printToFileAsync({
          html: htmlContent,
          base64: false,
        });

        // Create filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        const filename = `تقرير_المواريث_${madhhabName}_${timestamp}.pdf`;

        // The PDF is already saved at uri location
        const filePath = uri;

        // Share the file
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(filePath, {
            mimeType: 'application/pdf',
            dialogTitle: 'مشاركة التقرير',
            UTI: 'com.adobe.pdf',
          });
        } else {
          Alert.alert(
            'تم الحفظ',
            `تم حفظ التقرير في: ${filename}\n\nالمسار: ${filePath}`
          );
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'حدث خطأ في حفظ الملف';
        setPrintError(errorMessage);
        Alert.alert('خطأ', `فشل في حفظ الملف: ${errorMessage}`);
        console.error('Save PDF error:', error);
      } finally {
        setIsPrinting(false);
      }
    },
    [generatePDFHTML]
  );

  const shareReport = useCallback(
    async (
      madhab: string,
      madhhabName: string,
      estate: EstateData,
      heirs: HeirsData,
      result: CalculationResult
    ) => {
      try {
        setIsPrinting(true);
        setPrintError(null);

        const htmlContent = generatePDFHTML(madhab, madhhabName, estate, heirs, result);

        // Generate PDF
        const { uri } = await Print.printToFileAsync({
          html: htmlContent,
          base64: false,
        });

        // Sharing is available on most devices

        // Share
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'مشاركة تقرير المواريث',
          UTI: 'com.adobe.pdf',
        });

        Alert.alert('نجح', 'تم مشاركة التقرير بنجاح');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'حدث خطأ في المشاركة';
        setPrintError(errorMessage);
        Alert.alert('خطأ', `فشل في المشاركة: ${errorMessage}`);
        console.error('Share error:', error);
      } finally {
        setIsPrinting(false);
      }
    },
    [generatePDFHTML]
  );

  return {
    isPrinting,
    printError,
    printPDF,
    savePDFToFile,
    shareReport,
  };
}
