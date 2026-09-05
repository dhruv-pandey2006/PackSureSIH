export type ReadabilityStatus = 'PASS' | 'WARNING' | 'MANUAL_REVIEW';

export type ReadabilityScreening = {
  version: 1;
  status: ReadabilityStatus;
  imageWidth: number | null;
  imageHeight: number | null;
  wordCount: number;
  minWordHeightPx: number | null;
  medianWordHeightPx: number | null;
  p10WordHeightPx: number | null;
  smallTextRatio: number | null;
  smallTextThresholdRelative: number | null;
  reason: string;
};

type OcrWord = {
  text?: unknown;
  left?: unknown;
  top?: unknown;
  width?: unknown;
  height?: unknown;
};

const SMALL_TEXT_THRESHOLD_RELATIVE = 0.005;
const SMALL_TEXT_WARNING_RATIO = 0.1;

function percentile(sortedValues: number[], percentileRank: number): number {
  if (sortedValues.length === 1) return sortedValues[0];

  const position = (sortedValues.length - 1) * percentileRank;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  const weight = position - lower;

  return sortedValues[lower] + (sortedValues[upper] - sortedValues[lower]) * weight;
}

export function calculateReadability(
  ocrBoxes: unknown,
  imageWidth: number | null,
  imageHeight: number | null,
): ReadabilityScreening {
  const words =
    typeof ocrBoxes === 'object' && ocrBoxes !== null && 'words' in ocrBoxes && Array.isArray(ocrBoxes.words)
      ? (ocrBoxes.words as OcrWord[])
      : [];

  const validWords = words.filter(
    (word) =>
      typeof word.height === 'number' &&
      Number.isFinite(word.height) &&
      word.height > 0 &&
      typeof word.width === 'number' &&
      Number.isFinite(word.width) &&
      word.width > 0,
  );

  const dimensionsAreValid =
    typeof imageWidth === 'number' &&
    Number.isFinite(imageWidth) &&
    imageWidth > 0 &&
    typeof imageHeight === 'number' &&
    Number.isFinite(imageHeight) &&
    imageHeight > 0;

  if (!dimensionsAreValid || validWords.length === 0) {
    return {
      version: 1,
      status: 'MANUAL_REVIEW',
      imageWidth: dimensionsAreValid ? imageWidth : null,
      imageHeight: dimensionsAreValid ? imageHeight : null,
      wordCount: validWords.length,
      minWordHeightPx: null,
      medianWordHeightPx: null,
      p10WordHeightPx: null,
      smallTextRatio: null,
      smallTextThresholdRelative: null,
      reason: !dimensionsAreValid
        ? 'Image dimensions or reliable OCR geometry were unavailable; manual readability review is required.'
        : 'No usable OCR word geometry was available; manual readability review is required.',
    };
  }

  const heights = validWords
    .map((word) => word.height as number)
    .sort((left, right) => left - right);
  const relativeHeights = heights.map((height) => height / (imageHeight as number));
  const smallTextCount = relativeHeights.filter(
    (relativeHeight) => relativeHeight < SMALL_TEXT_THRESHOLD_RELATIVE,
  ).length;
  const smallTextRatio = smallTextCount / relativeHeights.length;
  const status = smallTextRatio >= SMALL_TEXT_WARNING_RATIO ? 'WARNING' : 'PASS';

  return {
    version: 1,
    status,
    imageWidth: imageWidth as number,
    imageHeight: imageHeight as number,
    wordCount: heights.length,
    minWordHeightPx: heights[0],
    medianWordHeightPx: percentile(heights, 0.5),
    p10WordHeightPx: percentile(heights, 0.1),
    smallTextRatio,
    smallTextThresholdRelative: SMALL_TEXT_THRESHOLD_RELATIVE,
    reason:
      status === 'WARNING'
        ? 'Some detected text regions are unusually small relative to this image; manual verification is recommended.'
        : 'No strong small-text signal was detected from the available OCR geometry. This is not a legal font-size determination.',
  };
}

export { SMALL_TEXT_THRESHOLD_RELATIVE, SMALL_TEXT_WARNING_RATIO };
