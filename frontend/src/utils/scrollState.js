// Lightweight target state for R3F Scene and GSAP ScrollTrigger
export const scrollState = {
  rotationY: 0,
  cameraZ: 9.2,
  cameraX: 0,
  cameraY: 0,
  earthScale: 0.85,
  globeOffsetX: 1.4,
  activeSection: 0,
  previewData: {
    title: 'Your Memory Title',
    category: 'Personal',
    image: null,
    unlockDate: '',
  },
  subscribers: new Set(),

  subscribe(fn) {
    this.subscribers.add(fn);
    return () => this.subscribers.delete(fn);
  },

  notify() {
    this.subscribers.forEach((fn) => fn(this));
  },

  setActiveSection(idx) {
    if (this.activeSection !== idx) {
      this.activeSection = idx;
      this.notify();
    }
  },

  setPreview(data) {
    this.previewData = { ...this.previewData, ...data };
    this.notify();
  },

  scrollToSection(index) {
    if (typeof window === 'undefined') return;
    const height = window.innerHeight;
    window.scrollTo({
      top: index * height,
      behavior: 'smooth',
    });
  },
};
