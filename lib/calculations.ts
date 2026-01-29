export type BodyType = 'Slim' | 'Normal' | 'Heavy';
export type ClothType = 'Shirt' | 'Pant' | 'Suit' | 'Kurta';

interface CalculationInput {
  heightFt: number;       // e.g., 5.8
  chest: number;          // e.g., 40
  waist: number;          // e.g., 34
  bodyType: BodyType;
  clothWidth?: number;    // Default 58 inches (Double Arnab) or 36 inches (Single Arnab)
}

export function calculateClothRequirement(type: ClothType, input: CalculationInput): string {
  const { heightFt, chest, bodyType } = input;
  
  // Convert Height to total Inches roughly (for length estimation if not provided)
  // Avg torso length is usually height * 0.45 roughly, but we use standard rules here.
  
  let clothNeededMeters = 0;

  // RULE 1: SHIRT (Standard width 36" - 44")
  if (type === 'Shirt') {
    // Basic Rule: (Length + Sleeve) approx. usually 1.6m for normal fit
    // Logic: Height 5'8" usually needs 1.6m. Height 6' needs 1.8m.
    // Heavy body needs wider cut, so we add 10-15%.
    
    if (heightFt < 5.5) clothNeededMeters = 1.50;
    else if (heightFt < 5.9) clothNeededMeters = 1.60;
    else clothNeededMeters = 1.80;

    if (bodyType === 'Heavy' || chest > 44) {
      clothNeededMeters += 0.25; // Add 25cm for heavy sizes
    }
  }

  // RULE 2: PANT (Standard width 58")
  else if (type === 'Pant') {
    // Basic Rule: 1.20m for standard height. 1.30m for tall.
    if (heightFt < 5.5) clothNeededMeters = 1.20;
    else if (heightFt < 6.0) clothNeededMeters = 1.30;
    else clothNeededMeters = 1.40;

    if (bodyType === 'Heavy') {
      clothNeededMeters += 0.10; // Extra buffer for pleats/width
    }
  }

  // RULE 3: SUIT (Jacket + Pant) - (Standard width 58")
  else if (type === 'Suit') {
    // Jacket takes approx 1.75m + Pant 1.25m = 3.00m usually.
    if (heightFt < 5.5) clothNeededMeters = 2.80;
    else if (heightFt < 6.0) clothNeededMeters = 3.00;
    else clothNeededMeters = 3.25;

    if (bodyType === 'Heavy' || chest > 46) {
      clothNeededMeters += 0.25; // Extra for large lapels/girth
    }
  }

  // RULE 4: KURTA (Standard width 36-44")
  else if (type === 'Kurta') {
    // Long top. Usually 2.0 to 2.5 meters.
    if (heightFt < 5.5) clothNeededMeters = 2.00;
    else if (heightFt < 6.0) clothNeededMeters = 2.25;
    else clothNeededMeters = 2.50;
  }

  return clothNeededMeters.toFixed(2); // Return as string "1.60"
}

export function getReasoning(type: ClothType, input: CalculationInput): string {
    const { bodyType, chest } = input;
    let reason = `Based on height ${input.heightFt}'`;
    
    if (bodyType === 'Heavy' || chest > 44) {
        reason += ` and heavy build (Chest ${chest}"), extra margins added.`;
    } else {
        reason += ` and normal build.`;
    }
    return reason;
}