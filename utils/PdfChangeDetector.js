// utils/pdfChangeDetector.js

export class PdfChangeDetector {
  constructor() {
    this.snapshots = {};
  }

  // ✅ Original data save karo
  takeSnapshot(store) {
    const state = store.getState();
    this.snapshots = {
      page1: JSON.stringify(state.page1Slice),
      page2: JSON.stringify(state.page3),
      page3: JSON.stringify(state.page2),
      pricing: JSON.stringify(state.pricing),
      paymentTerms: JSON.stringify(state.paymentTerms),
    };
  }

  // ✅ Check if ANY slice changed
  hasChanges(store) {
    const state = store.getState();
    
    return (
      this.snapshots.page1 !== JSON.stringify(state.page1Slice) ||
      this.snapshots.page2 !== JSON.stringify(state.page3) ||
      this.snapshots.page3 !== JSON.stringify(state.page2) ||
      this.snapshots.pricing !== JSON.stringify(state.pricing) ||
      this.snapshots.paymentTerms !== JSON.stringify(state.paymentTerms)
    );
  }

  // ✅ Specific slice check
  hasSliceChanged(store, sliceName) {
    const state = store.getState();
    const sliceMap = {
      page1: 'page1Slice',
      page2: 'page3',
      page3: 'page2',
      pricing: 'pricing',
      paymentTerms: 'paymentTerms',
    };
    
    const actualSliceName = sliceMap[sliceName];
    return this.snapshots[sliceName] !== JSON.stringify(state[actualSliceName]);
  }

  reset() {
    this.snapshots = {};
  }
}

// Singleton instance
export const pdfDetector = new PdfChangeDetector();