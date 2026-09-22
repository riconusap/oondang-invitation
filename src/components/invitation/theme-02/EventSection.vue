<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useIntersectionObserver } from '../../../composables/useIntersectionObserver';
import type { Invitation } from '@/types/invitation';

const props = defineProps<{
  invitation?: Invitation | null
}>();

const targetHeader = ref<HTMLElement | null>(null);
const targetEvents = ref<HTMLElement | null>(null);

const { isIntersecting: isHeaderIntersecting } = useIntersectionObserver(targetHeader);
const { isIntersecting: isEventsIntersecting } = useIntersectionObserver(targetEvents);

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

const eventDateObj = computed(() => {
    let dateStr = '2026-12-12';
    if (props.invitation?.customTexts?.eventDateRaw) {
        dateStr = props.invitation.customTexts.eventDateRaw;
    } else if (props.invitation?.events && props.invitation.events.length > 0) {
        dateStr = props.invitation.events[0].date;
    }
    return new Date(dateStr);
});

const day = computed(() => eventDateObj.value.getDate().toString().padStart(2, '0'));
const month = computed(() => (eventDateObj.value.getMonth() + 1).toString().padStart(2, '0'));
const year = computed(() => eventDateObj.value.getFullYear().toString().slice(-2));

const eventList = computed(() => {
  if (props.invitation?.events && props.invitation.events.length > 0) {
    return props.invitation.events.map(e => {
      const dateParts = formatDateParts(e.date, props.invitation?.customTexts?.eventDateRaw || '2026-12-12');
      return {
        ...e,
        dateObj: dateParts,
        mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${e.addressTitle} ${e.addressDetails}`)}`
      };
    });
  }
  
  // Fallback for older data
  const akadDateParts = formatDateParts(props.invitation?.customTexts?.akadDate, props.invitation?.customTexts?.eventDateRaw || '2026-12-12');
  const resepsiDateParts = formatDateParts(props.invitation?.customTexts?.resepsiDate, props.invitation?.customTexts?.eventDateRaw || '2026-12-12');
  
  return [
    {
      id: 'akad',
      title: props.invitation?.customTexts?.akadTitle || 'Akad Nikah',
      dateObj: akadDateParts,
      time: props.invitation?.customTexts?.akadTime || '08:00 - 10:00 WIB',
      addressTitle: props.invitation?.customTexts?.akadAddressTitle || 'KEDIAMAN MEMPELAI WANITA',
      addressDetails: props.invitation?.customTexts?.akadAddressDetails || 'Kp. Cikareumbi RT 04/04, Gang Aki Sana, Desa Cikidang, Kec. Lembang, Kab. Bandung Barat',
      mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${props.invitation?.customTexts?.akadAddressTitle || 'KEDIAMAN MEMPELAI WANITA'} ${props.invitation?.customTexts?.akadAddressDetails || 'Kp. Cikareumbi RT 04/04, Gang Aki Sana, Desa Cikidang, Kec. Lembang, Kab. Bandung Barat'}`)}`
    },
    {
      id: 'resepsi',
      title: props.invitation?.customTexts?.resepsiTitle || 'Resepsi Pernikahan',
      dateObj: resepsiDateParts,
      time: props.invitation?.customTexts?.resepsiTime || '10:00 - 18:00 WIB',
      addressTitle: props.invitation?.customTexts?.resepsiAddressTitle || 'KEDIAMAN MEMPELAI WANITA',
      addressDetails: props.invitation?.customTexts?.resepsiAddressDetails || 'Kp. Cikareumbi RT 04/04, Gang Aki Sana, Desa Cikidang, Kec. Lembang, Kab. Bandung Barat',
      mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${props.invitation?.customTexts?.resepsiAddressTitle || 'KEDIAMAN MEMPELAI WANITA'} ${props.invitation?.customTexts?.resepsiAddressDetails || 'Kp. Cikareumbi RT 04/04, Gang Aki Sana, Desa Cikidang, Kec. Lembang, Kab. Bandung Barat'}`)}`
    }
  ];
});

const eventBgImage = computed(() => {
    return props.invitation?.customImages?.event_bg || 'https://placehold.co/480x800/111111/4a4036?text=Event+Background';
});

const heroBgImage = computed(() => {
    return props.invitation?.customImages?.hero_bg || 'https://placehold.co/480x800/111111/4a4036?text=Hero+Background';
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
  <section class="bg-sage-700 relative z-20">
      
      <!-- Top Section: Save the Date & Countdown -->
      <div 
        ref="targetHeader"
        :class="[
            'px-6 pt-24 pb-8 transition-all duration-800 ease-out will-change-[opacity,transform] relative overflow-hidden',
            isHeaderIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        ]"
      >
          <!-- Top right curve design -->
          <div class="absolute top-0 right-0 w-2/3 h-full border-l border-b border-sage-600/50 rounded-bl-[6rem] z-0 pointer-events-none"></div>

          <div class="relative z-10 w-full mb-12">
             <h2 class="text-[3.5rem] leading-none font-wedding-serif text-zinc-800 uppercase tracking-widest mb-1">SAVE</h2>
             <h3 class="text-4xl font-wedding-serif italic text-zinc-800">The Date</h3>
          </div>
          
          <!-- Countdown -->
          <div class="flex justify-start gap-8 text-center ml-2 relative z-10">
              <div class="flex flex-col items-center">
                  <span class="text-3xl font-wedding-serif text-zinc-800">{{ daysStr }}</span>
                  <span class="text-[10px] text-zinc-600 uppercase tracking-widest mt-2">Hari</span>
              </div>
              <div class="flex flex-col items-center">
                  <span class="text-3xl font-wedding-serif text-zinc-800">{{ hoursStr }}</span>
                  <span class="text-[10px] text-zinc-600 uppercase tracking-widest mt-2">Jam</span>
              </div>
              <div class="flex flex-col items-center">
                  <span class="text-3xl font-wedding-serif text-zinc-800">{{ minutesStr }}</span>
                  <span class="text-[10px] text-zinc-600 uppercase tracking-widest mt-2">Menit</span>
              </div>
              <div class="flex flex-col items-center">
                  <span class="text-3xl font-wedding-serif text-zinc-800">{{ secondsStr }}</span>
                  <span class="text-[10px] text-zinc-600 uppercase tracking-widest mt-2">Detik</span>
              </div>
          </div>
      </div>

      <!-- Middle Section: Image and Vertical Date -->
      <div class="flex relative w-full mb-12 mt-8">
          <div class="w-[4.5rem] sm:w-[5.5rem] flex flex-col items-center justify-start pt-8 pb-12 z-10 shrink-0">
              <div class="w-px h-28 bg-white/70 mb-6"></div>
              <div class="flex flex-col gap-6 text-xl font-wedding-serif tracking-widest text-zinc-800">
                  <span>{{ day }}</span>
                  <span>{{ month }}</span>
                  <span>{{ year }}</span>
              </div>
          </div>
          
          <div class="flex-1 relative overflow-hidden rounded-tl-[6rem] sm:rounded-tl-[7rem] border-t border-l border-sage-600/50 h-[32rem]">
             <img :src="eventBgImage" alt="Event" class="absolute inset-0 w-full h-full object-cover object-center" />
          </div>
      </div>

      <!-- Bottom Section: Unified Event Card with hero_bg background -->
      <div class="relative w-full overflow-hidden py-24 px-6">
          <img :src="heroBgImage" class="absolute inset-0 w-full h-full object-cover opacity-30" />
          <div class="absolute inset-0 bg-sage-50/90 backdrop-blur-sm"></div>
          
          <div 
            ref="targetEvents"
            :class="[
                'relative z-10 w-full bg-white rounded-t-full rounded-b-[3rem] p-10 shadow-2xl border border-sage-200 transition-all duration-1000 ease-out will-change-[opacity,transform]',
                isEventsIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            ]"
          >
              <template v-for="(event, index) in eventList" :key="event.id">
                  <div :class="['text-center', index === 0 ? 'pt-8 mb-12' : 'mb-10']">
                      <h3 class="font-wedding-serif text-[2rem] leading-none italic text-sage-700 mb-6">{{ event.title }}</h3>
                      <div class="mb-6">
                         <p class="font-wedding-serif text-lg tracking-widest uppercase text-zinc-500 mb-2">{{ event.dateObj.hari }}</p>
                         <p class="font-wedding-serif text-[2rem] text-zinc-800 tracking-widest mb-2 leading-none">{{ event.dateObj.day }} / {{ event.dateObj.month }} / {{ event.dateObj.fullYear }}</p>
                         <p class="text-xs font-sans tracking-widest text-zinc-500 uppercase">{{ event.time }}</p>
                      </div>
                      <div>
                         <p class="font-wedding-serif text-md tracking-widest uppercase text-zinc-800 mb-2">{{ event.addressTitle }}</p>
                         <p class="text-xs font-sans text-zinc-500 leading-relaxed">{{ event.addressDetails }}</p>
                      </div>
                  </div>
                  
                  <!-- Elegant Divider -->
                  <div v-if="index < eventList.length - 1" class="flex items-center justify-center gap-4 my-8">
                      <div class="h-px flex-1 bg-gradient-to-r from-transparent to-sage-300"></div>
                      <i class="fa-solid fa-rings-wedding text-sage-400 text-2xl"></i>
                      <div class="h-px flex-1 bg-gradient-to-l from-transparent to-sage-300"></div>
                  </div>
              </template>
              
              <div v-if="eventList.length > 0" class="flex justify-center pb-4 mt-6">
                  <a :href="eventList[eventList.length - 1].mapUrl" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center px-8 py-3 bg-sage-700 text-white text-xs font-bold uppercase tracking-wider hover:bg-sage-800 transition rounded-full shadow-lg">
                      <i class="fa-solid fa-map-location-dot mr-2"></i> Buka Google Map
                  </a>
              </div>
          </div>
      </div>
  </section>
</template>
