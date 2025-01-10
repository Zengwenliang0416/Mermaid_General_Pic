import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useFormatStore = defineStore('format', () => {
  const formats = ref<string[]>([]);
  const themes = ref<string[]>([]);
  const backgrounds = ref<string[]>([]);
  const dpiRange = ref<{ min: number; max: number; default: number }>({
    min: 300,
    max: 1200,
    default: 300
  });

  const fetchFormats = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/formats`);
      if (!response.ok) {
        throw new Error('Failed to fetch formats');
      }
      const data = await response.json();
      formats.value = data.formats;
      themes.value = data.themes;
      backgrounds.value = data.backgrounds;
      dpiRange.value = data.dpiRange;
    } catch (error) {
      console.error('Error fetching formats:', error);
    }
  };

  return {
    formats,
    themes,
    backgrounds,
    dpiRange,
    fetchFormats
  };
}); 