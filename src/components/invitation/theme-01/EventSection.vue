<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useIntersectionObserver } from '../../../composables/useIntersectionObserver';
import type { Invitation } from '@/types/invitation';

const props = defineProps<{
  invitation?: Invitation | null
}>();

const targetHeader = ref<HTMLElement | null>(null);
const targetAkad = ref<HTMLElement | null>(null);
const targetResepsi = ref<HTMLElement | null>(null);

const { isIntersecting: isHeaderIntersecting } = useIntersectionObserver(targetHeader);
const { isIntersecting: isAkadIntersecting } = useIntersectionObserver(targetAkad);
const { isIntersecting: isResepsiIntersecting } = useIntersectionObserver(targetResepsi);

const akadAddressTitle = computed(() => props.invitation?.customTexts?.akadAddressTitle || 'KEDIAMAN MEMPELAI WANITA');
const akadAddressDetails = computed(() => props.invitation?.customTexts?.akadAddressDetails || 'Kp. Cikareumbi RT 04/04, Gang Aki Sana, Desa Cikidang, Kec. Lembang, Kab. Bandung Barat');

const resepsiAddressTitle = computed(() => props.invitation?.customTexts?.resepsiAddressTitle || 'KEDIAMAN MEMPELAI WANITA');
const resepsiAddressDetails = computed(() => props.invitation?.customTexts?.resepsiAddressDetails || 'Kp. Cikareumbi RT 04/04, Gang Aki Sana, Desa Cikidang, Kec. Lembang, Kab. Bandung Barat');

const akadMapUrl = computed(() => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${akadAddressTitle.value} ${akadAddressDetails.value}`)}`);
const resepsiMapUrl = computed(() => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${resepsiAddressTitle.value} ${resepsiAddressDetails.value}`)}`);

const eventDateObj = computed(() => {
    let dateStr = '2026-12-12';
    if (props.invitation?.customTexts?.eventDateRaw) {
        dateStr = props.invitation.customTexts.eventDateRaw;
    }
    return new Date(dateStr);
});

const formatDateParts = (dateStr: string | undefined, defaultDateStr: string) => {
    const d = new Date(dateStr || defaultDateStr);
    const days = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
    return {
        day: d.getDate().toString().padStart(2, '0'),
        month: (d.getMonth() + 1).toString().padStart(2, '0'),
        year: d.getFullYear().toString().slice(-2),
        fullYear: d.getFullYear().toString(),
        hari: days[d.getDay()]
    };
};

const akadDateObj = computed(() => formatDateParts(props.invitation?.customTexts?.akadDate, props.invitation?.customTexts?.eventDateRaw || '2026-12-12'));
const resepsiDateObj = computed(() => formatDateParts(props.invitation?.customTexts?.resepsiDate, props.invitation?.customTexts?.eventDateRaw || '2026-12-12'));

const day = computed(() => eventDateObj.value.getDate().toString().padStart(2, '0'));
const month = computed(() => (eventDateObj.value.getMonth() + 1).toString().padStart(2, '0'));
const year = computed(() => eventDateObj.value.getFullYear().toString().slice(-2));

const eventBgImage = computed(() => {
    return props.invitation?.customImages?.event_bg || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80';
});

const heroBgImage = computed(() => {
    return props.invitation?.customImages?.hero_bg || 'https://images.unsplash.com/photo-1465495972077-4364ea166d61?auto=format&fit=crop&w=800&q=80';
});

// Countdown Logic
const targetDateStr = computed(() => {
    return `${eventDateObj.value.getFullYear()}-${(eventDateObj.value.getMonth()+1).toString().padStart(2,'0')}-${eventDateObj.value.getDate().toString().padStart(2,'0')}T08:00:00`;
});
const targetDate = computed(() => new Date(targetDateStr.value).getTime());

const daysStr = ref('00');
const hoursStr = ref('00');
const minutesStr = ref('00');
const secondsStr = ref('00');

let countdownInterval: ReturnType<typeof setInterval>;

onMounted(() => {
    countdownInterval = setInterval(() => {
        const now = new Date().getTime();
        const distance = targetDate.value - now;

        if (distance < 0) {
            clearInterval(countdownInterval);
            return;
        }

        const d = Math.floor(distance / (1000 * 60 * 60 * 24));
        const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((distance % (1000 * 60)) / 1000);

        daysStr.value = d < 10 ? "0" + d : String(d);
        hoursStr.value = h < 10 ? "0" + h : String(h);
        minutesStr.value = m < 10 ? "0" + m : String(m);
        secondsStr.value = s < 10 ? "0" + s : String(s);
    }, 1000);
});

onUnmounted(() => {
    if (countdownInterval) clearInterval(countdownInterval);
});
</script>

<template>
  <section class="bg-black relative z-20">
      
      <!-- Top Section: Save the Date & Countdown -->
      <div 
        ref="targetHeader"
        :class="[
            'px-6 pt-24 pb-8 transition-all duration-800 ease-out will-change-[opacity,transform] relative overflow-hidden',
            isHeaderIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        ]"
      >
          <!-- Top right curve design -->
          <div class="absolute top-0 right-0 w-2/3 h-full border-l border-b border-white/50 rounded-bl-[6rem] z-0 pointer-events-none"></div>

          <div class="relative z-10 w-full mb-12">
             <h2 class="text-[3.5rem] leading-none font-wedding-serif text-white uppercase tracking-widest mb-1">SAVE</h2>
             <h3 class="text-4xl font-wedding-serif italic text-white">The Date</h3>
          </div>
          
          <!-- Countdown -->
          <div class="flex justify-start gap-8 text-center ml-2 relative z-10">
              <div class="flex flex-col items-center">
                  <span class="text-3xl font-wedding-serif text-white">{{ daysStr }}</span>
                  <span class="text-[10px] text-zinc-300 uppercase tracking-widest mt-2">Hari</span>
              </div>
              <div class="flex flex-col items-center">
                  <span class="text-3xl font-wedding-serif text-white">{{ hoursStr }}</span>
                  <span class="text-[10px] text-zinc-300 uppercase tracking-widest mt-2">Jam</span>
              </div>
              <div class="flex flex-col items-center">
                  <span class="text-3xl font-wedding-serif text-white">{{ minutesStr }}</span>
                  <span class="text-[10px] text-zinc-300 uppercase tracking-widest mt-2">Menit</span>
              </div>
              <div class="flex flex-col items-center">
                  <span class="text-3xl font-wedding-serif text-white">{{ secondsStr }}</span>
                  <span class="text-[10px] text-zinc-300 uppercase tracking-widest mt-2">Detik</span>
              </div>
          </div>
      </div>

      <!-- Middle Section: Image and Vertical Date -->
      <div class="flex relative w-full mb-12 mt-8">
          <div class="w-[4.5rem] sm:w-[5.5rem] flex flex-col items-center justify-start pt-8 pb-12 z-10 shrink-0">
              <div class="w-px h-28 bg-white/70 mb-6"></div>
              <div class="flex flex-col gap-6 text-xl font-wedding-serif tracking-widest text-white">
                  <span>{{ day }}</span>
                  <span>{{ month }}</span>
                  <span>{{ year }}</span>
              </div>
          </div>
          
          <div class="flex-1 relative overflow-hidden rounded-tl-[6rem] sm:rounded-tl-[7rem] border-t border-l border-white/50 h-[32rem]">
             <img :src="eventBgImage" alt="Event" class="absolute inset-0 w-full h-full object-cover object-center" />
          </div>
      </div>

      <!-- Bottom Section: Akad & Resepsi with hero_bg background -->
      <div class="relative w-full overflow-hidden py-24 px-6 rounded-t-[3rem] shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
          <img :src="heroBgImage" class="absolute inset-0 w-full h-full object-cover opacity-60" />
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
          
          <div class="relative z-10 space-y-12">
              <!-- Akad Card -->
              <div 
                ref="targetAkad"
                :class="[
                    'flex flex-col bg-white/10 backdrop-blur-md p-8 rounded-[2rem] border border-white/20 shadow-2xl transition-all duration-800 ease-out will-change-[opacity,transform]',
                    isAkadIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                ]"
              >
                  <h3 class="font-wedding-serif text-[2.5rem] leading-none italic text-white mb-8 text-center">{{ props.invitation?.customTexts?.akadTitle || 'Akad Nikah' }}</h3>
                  
                  <div class="mb-8 text-center border-b border-white/20 pb-8">
                     <p class="font-wedding-serif text-lg tracking-widest uppercase text-zinc-300 mb-2">{{ akadDateObj.hari }}</p>
                     <p class="font-wedding-serif text-[2rem] text-white tracking-widest mb-3 leading-none">{{ akadDateObj.day }} / {{ akadDateObj.month }} / {{ akadDateObj.fullYear }}</p>
                     <p class="text-xs font-sans tracking-widest text-zinc-400 uppercase">{{ props.invitation?.customTexts?.akadTime || '08:00 - 10:00 WIB' }}</p>
                  </div>
                  
                  <div class="mb-8 text-center">
                     <i class="fa-solid fa-location-dot text-white text-xl mb-3"></i>
                     <p class="font-wedding-serif text-lg tracking-widest uppercase text-white mb-2">{{ akadAddressTitle }}</p>
                     <p class="text-sm font-sans text-zinc-300 leading-relaxed">{{ akadAddressDetails }}</p>
                  </div>
                  
                  <div class="flex justify-center">
                      <a :href="akadMapUrl" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center px-8 py-3 bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-zinc-200 transition rounded-full">
                          <i class="fa-solid fa-map-location-dot mr-2"></i> Google Map
                      </a>
                  </div>
              </div>

              <!-- Resepsi Card -->
              <div 
                ref="targetResepsi"
                :class="[
                    'flex flex-col bg-white/10 backdrop-blur-md p-8 rounded-[2rem] border border-white/20 shadow-2xl transition-all duration-800 ease-out will-change-[opacity,transform]',
                    isResepsiIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                ]"
              >
                  <h3 class="font-wedding-serif text-[2.5rem] leading-none italic text-white mb-8 text-center">{{ props.invitation?.customTexts?.resepsiTitle || 'Resepsi Pernikahan' }}</h3>
                  
                  <div class="mb-8 text-center border-b border-white/20 pb-8">
                     <p class="font-wedding-serif text-lg tracking-widest uppercase text-zinc-300 mb-2">{{ resepsiDateObj.hari }}</p>
                     <p class="font-wedding-serif text-[2rem] text-white tracking-widest mb-3 leading-none">{{ resepsiDateObj.day }} / {{ resepsiDateObj.month }} / {{ resepsiDateObj.fullYear }}</p>
                     <p class="text-xs font-sans tracking-widest text-zinc-400 uppercase">{{ props.invitation?.customTexts?.resepsiTime || '10:00 - 18:00 WIB' }}</p>
                  </div>
                  
                  <div class="mb-8 text-center">
                     <i class="fa-solid fa-location-dot text-white text-xl mb-3"></i>
                     <p class="font-wedding-serif text-lg tracking-widest uppercase text-white mb-2">{{ resepsiAddressTitle }}</p>
                     <p class="text-sm font-sans text-zinc-300 leading-relaxed">{{ resepsiAddressDetails }}</p>
                  </div>
                  
                  <div class="flex justify-center">
                      <a :href="resepsiMapUrl" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center px-8 py-3 bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-zinc-200 transition rounded-full">
                          <i class="fa-solid fa-map-location-dot mr-2"></i> Google Map
                      </a>
                  </div>
              </div>
          </div>
      </div>
  </section>
</template>
