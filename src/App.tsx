/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Book, 
  Ticket, 
  ClipboardList, 
  Calculator, 
  Users, 
  ChevronRight, 
  X, 
  Check, 
  ArrowRightLeft,
  MapPin,
  Calendar,
  QrCode,
  Plane,
  Train,
  Hotel,
  Map,
  Sparkles,
  Loader2,
  Sun,
  Cloud,
  CloudRain,
  Wind,
  ShieldCheck,
  Utensils,
  ShoppingBag
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// --- Types ---
type Tab = 'JOURNAL' | 'TICKET' | 'PLANNING' | 'EXPENSE' | 'CREDITS';

interface WeatherForecast {
  time: string;
  temp: number;
  condition: 'SUN' | 'CLOUD' | 'RAIN' | 'WIND';
}

interface ItineraryItem {
  time: string;
  name: string;
  type: 'TRANSPORT' | 'STAY' | 'FOOD' | 'SPOT' | 'SHOPPING';
  image?: string;
  query?: string;
}

interface JournalEntry {
  day: number;
  title: string;
  subtitle: string;
  image: string;
  description: string;
  itinerary: ItineraryItem[];
  weather: WeatherForecast[];
}

interface TicketItem {
  id: string;
  type: 'FLIGHT' | 'TRAIN' | 'HOTEL';
  title: string;
  detail?: string;
  time?: string;
  gateRoom?: string;
  seatClass?: string;
  address?: string;
  Tel?: string;
  location?: string;
}

interface Transaction {
  id: string;
  amount: number;
  category: 'FOOD' | 'TRANSPORT' | 'SHOPPING' | 'STAY' | 'OTHER';
  note: string;
  date: string;
}

interface PlanningItem {
  id: string;
  category: string;
  subCategory?: string;
  text: string;
  completed: boolean;
  note?: string;
}

// --- Constants ---
// [圖片更換指南]
// 1. 封面照片 (Journal Cover): 建議尺寸 1200x800 (3:2) 或 1200x675 (16:9)
// 2. 行程照片 (Itinerary Item): 建議尺寸 400x400 (1:1)
// 3. 成員頭像 (Avatar): 建議尺寸 200x200 (1:1)
// 
// 如果照片放在 GitHub，請使用原始檔案連結 (Raw link)，例如:
// https://raw.githubusercontent.com/用戶名/倉庫名/分支名/路徑/圖片.jpg

const JOURNAL_DATA: JournalEntry[] = [
  {
    day: 1,
    title: "熊本初見",
    subtitle: "Kumamoto First Sight",
    // Day 1 封面照片
    image: "https://raw.githubusercontent.com/polarishock/Kumamoto2026/main/photos/day1top.jpg",
    description: "從桃園機場出發，抵達熊本後展開旅程。品嚐著名的勝烈亭豬排，漫步於歷史悠久的熊本城，夜晚前往博多享用美味燒肉。",
    itinerary: [
      { time: "04:00 - 04:30", name: "家裡出發 → 桃園機場", type: 'TRANSPORT' },
      // 星宇航空照片
      { time: "07:30 - 10:45", name: "桃園機場(T1) → 熊本機場 (星宇 JX846)", type: 'TRANSPORT', image: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=400&q=80" },
      { time: "12:07 - 13:05", name: "熊本機場 → 熊本市區 (產交巴士)", type: 'TRANSPORT' },
      { time: "12:40 - 13:00", name: "飯店寄放行李", type: 'STAY' },
      // 勝烈亭豬排照片
      { time: "13:00 - 14:30", name: "勝烈亭豬排", type: 'FOOD', image: "https://images.unsplash.com/photo-1626202340516-636827926a07?auto=format&fit=crop&w=400&q=80", query: "Katsuretsutei" },
      // 熊本城照片
      { time: "15:00 - 17:30", name: "熊本城參觀", type: 'SPOT', image: "https://images.unsplash.com/photo-1590230441637-d635073fe4aa?auto=format&fit=crop&w=400&q=80", query: "Kumamoto Castle" },
      { time: "18:00 - 18:40", name: "熊本 → 博多 (新幹線)", type: 'TRANSPORT' },
      // 博多燒肉照片
      { time: "19:00 - 21:30", name: "博多燒肉 (預約)", type: 'FOOD', image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=400&q=80", query: "Hakata Yakiniku" },
      { time: "21:30 之後", name: "博多 → 熊本", type: 'TRANSPORT' }
    ],
    weather: [
      { time: "08:00", temp: 22, condition: 'SUN' },
      { time: "09:00", temp: 23, condition: 'SUN' },
      { time: "10:00", temp: 24, condition: 'SUN' },
      { time: "11:00", temp: 25, condition: 'SUN' },
      { time: "12:00", temp: 26, condition: 'SUN' },
      { time: "13:00", temp: 27, condition: 'SUN' },
      { time: "14:00", temp: 27, condition: 'SUN' },
      { time: "15:00", temp: 26, condition: 'CLOUD' },
      { time: "16:00", temp: 25, condition: 'CLOUD' },
      { time: "17:00", temp: 24, condition: 'CLOUD' },
      { time: "18:00", temp: 24, condition: 'CLOUD' },
      { time: "19:00", temp: 23, condition: 'CLOUD' },
      { time: "20:00", temp: 22, condition: 'CLOUD' },
      { time: "21:00", temp: 21, condition: 'CLOUD' },
      { time: "22:00", temp: 21, condition: 'CLOUD' }
    ]
  },
  {
    day: 2,
    title: "糸島海風",
    subtitle: "Itoshima Sea Breeze",
    // Day 2 封面照片
    image: "https://raw.githubusercontent.com/polarishock/Kumamoto2026/main/photos/day2top.jpg",
    description: "參加糸島深度一日遊。從白絲瀑布的清涼到雷山千如寺的莊嚴，再到櫻井二見浦的浪漫海洋，感受糸島獨特的自然魅力。",
    itinerary: [
      { time: "07:00 - 08:00", name: "早餐自理", type: 'FOOD' },
      { time: "08:00 - 08:40", name: "熊本 → 博多 (新幹線)", type: 'TRANSPORT' },
      { time: "08:50 - 09:00", name: "博多車站集合 (KKDAY 糸島一日遊)", type: 'TRANSPORT' },
      // 白絲瀑布照片
      { time: "10:00 - 10:30", name: "九州糸島 - 白絲瀑布", type: 'SPOT', image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=400&q=80", query: "Shiraito Falls" },
      { time: "11:00 - 11:40", name: "雷山千如寺大悲王院", type: 'SPOT', query: "Raizan Sennyoji Daihibo-in" },
      { time: "12:20 - 12:50", name: "椰子樹鞦韆", type: 'SPOT' },
      // 櫻井二見浦照片
      { time: "13:10 - 13:30", name: "櫻井二見浦夫婦岩 & 天使之翼", type: 'SPOT', image: "https://images.unsplash.com/photo-1505069194752-51c76275c32a?auto=format&fit=crop&w=400&q=80", query: "Sakurai Futamigaura" },
      { time: "13:30 - 14:50", name: "糸島海鮮堂 (二見浦本店)", type: 'FOOD', query: "Itoshima Kaisendo" },
      { time: "15:20 - 15:50", name: "龍貓森林步道：芥屋大門", type: 'SPOT' },
      // 福岡塔照片
      { time: "16:40 - 17:30", name: "福岡塔欣賞夕陽", type: 'SPOT', image: "https://images.unsplash.com/photo-1542931237-323a1b1abc72?auto=format&fit=crop&w=400&q=80", query: "Fukuoka Tower" },
      { time: "17:40 - 18:00", name: "返回博多", type: 'TRANSPORT' },
      { time: "19:00 - 21:30", name: "晚餐", type: 'FOOD' },
      { time: "21:30 之後", name: "博多 → 熊本", type: 'TRANSPORT' }
    ],
    weather: [
      { time: "08:00", temp: 21, condition: 'SUN' },
      { time: "09:00", temp: 22, condition: 'SUN' },
      { time: "10:00", temp: 23, condition: 'SUN' },
      { time: "11:00", temp: 24, condition: 'SUN' },
      { time: "12:00", temp: 25, condition: 'SUN' },
      { time: "13:00", temp: 26, condition: 'SUN' },
      { time: "14:00", temp: 26, condition: 'SUN' },
      { time: "15:00", temp: 25, condition: 'SUN' },
      { time: "16:00", temp: 24, condition: 'SUN' },
      { time: "17:00", temp: 23, condition: 'SUN' },
      { time: "18:00", temp: 23, condition: 'SUN' },
      { time: "19:00", temp: 22, condition: 'SUN' },
      { time: "20:00", temp: 21, condition: 'SUN' },
      { time: "21:00", temp: 21, condition: 'SUN' },
      { time: "22:00", temp: 20, condition: 'CLOUD' }
    ]
  },
  {
    day: 3,
    title: "福岡漫遊",
    subtitle: "Fukuoka City Walk",
    // Day 3 封面照片
    image: "https://raw.githubusercontent.com/polarishock/Kumamoto2026/main/photos/day3top.jpg",
    description: "前往能古島海島公園享受自然美景與絕景烤肉。下午回到天神商圈與博多運河城盡情購物，最後以熱騰騰的牛腸鍋與LaLaport鋼彈劃下句點。",
    itinerary: [
      { time: "07:00 - 08:00", name: "早餐自理", type: 'FOOD' },
      { time: "08:00 - 08:40", name: "熊本 → 博多 (新幹線)", type: 'TRANSPORT' },
      // 能古島照片
      { time: "09:00 - 12:30", name: "能古島海島公園", type: 'SPOT', image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=400&q=80", query: "Nokonoshima Island Park" },
      { time: "12:00 - 12:50", name: "能古島漢堡 / 黑毛和牛烤肉", type: 'FOOD' },
      { time: "13:00 - 13:20", name: "姪濱站 → 天神站", type: 'TRANSPORT' },
      // 天神購物照片
      { time: "13:30 - 16:00", name: "天神商圈購物 (PARCO / mina / Bic Camera)", type: 'SHOPPING', image: "https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?auto=format&fit=crop&w=400&q=80", query: "Tenjin Shopping" },
      { time: "16:30 - 16:50", name: "博多運河城 (明太子麵包)", type: 'SHOPPING' },
      { time: "17:00 - 18:30", name: "博多站商圈", type: 'SHOPPING' },
      { time: "18:30 - 19:30", name: "牛腸鍋", type: 'FOOD' },
      // 鋼彈照片
      { time: "19:30 - 21:00", name: "LaLaport 福岡 (實物大鋼彈)", type: 'SPOT', image: "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?auto=format&fit=crop&w=400&q=80", query: "LaLaport Fukuoka" },
      { time: "21:00 之後", name: "博多 → 熊本", type: 'TRANSPORT' }
    ],
    weather: [
      { time: "08:00", temp: 20, condition: 'CLOUD' },
      { time: "09:00", temp: 21, condition: 'CLOUD' },
      { time: "10:00", temp: 22, condition: 'CLOUD' },
      { time: "11:00", temp: 23, condition: 'CLOUD' },
      { time: "12:00", temp: 24, condition: 'CLOUD' },
      { time: "13:00", temp: 25, condition: 'CLOUD' },
      { time: "14:00", temp: 25, condition: 'CLOUD' },
      { time: "15:00", temp: 24, condition: 'CLOUD' },
      { time: "16:00", temp: 23, condition: 'CLOUD' },
      { time: "17:00", temp: 22, condition: 'CLOUD' },
      { time: "18:00", temp: 22, condition: 'RAIN' },
      { time: "19:00", temp: 21, condition: 'RAIN' },
      { time: "20:00", temp: 20, condition: 'RAIN' },
      { time: "21:00", temp: 20, condition: 'RAIN' },
      { time: "22:00", temp: 19, condition: 'RAIN' }
    ]
  },
  {
    day: 4,
    title: "歸途時光",
    subtitle: "Homebound Journey",
    // Day 4 封面照片
    image: "https://raw.githubusercontent.com/polarishock/Kumamoto2026/main/photos/day4top.jpg",
    description: "最後的熊本時光。辦理退房後前往機場，在觀景台欣賞飛機起降，並在商店區挑選伴手禮，帶著滿滿的回憶返回家園。",
    itinerary: [
      { time: "07:00 - 07:10", name: "辦理退房", type: 'STAY' },
      { time: "07:43 - 08:40", name: "搭乘產交巴士前往機場", type: 'TRANSPORT' },
      // 熊本機場照片
      { time: "10:00 - 11:30", name: "熊本機場商店區 & 觀景台", type: 'SHOPPING', image: "https://images.unsplash.com/photo-1436491865332-7a61a109c0f2?auto=format&fit=crop&w=400&q=80", query: "Kumamoto Airport" },
      // 返程飛機照片
      { time: "11:55 - 13:20", name: "熊本機場 → 桃園機場 (星宇 JX847)", type: 'TRANSPORT', image: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=400&q=80" },
      { time: "14:00 之後", name: "返家", type: 'TRANSPORT' }
    ],
    weather: [
      { time: "08:00", temp: 18, condition: 'SUN' },
      { time: "09:00", temp: 19, condition: 'SUN' },
      { time: "10:00", temp: 20, condition: 'SUN' },
      { time: "11:00", temp: 21, condition: 'SUN' },
      { time: "12:00", temp: 22, condition: 'SUN' },
      { time: "13:00", temp: 23, condition: 'SUN' },
      { time: "14:00", temp: 23, condition: 'SUN' },
      { time: "15:00", temp: 22, condition: 'SUN' },
      { time: "16:00", temp: 21, condition: 'SUN' },
      { time: "17:00", temp: 20, condition: 'SUN' },
      { time: "18:00", temp: 20, condition: 'SUN' },
      { time: "19:00", temp: 19, condition: 'SUN' },
      { time: "20:00", temp: 18, condition: 'SUN' },
      { time: "21:00", temp: 18, condition: 'SUN' },
      { time: "22:00", temp: 17, condition: 'SUN' }
    ]
  }
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 't1', amount: 1200, category: 'FOOD', note: '一蘭拉麵', date: '2026-02-28' },
  { id: 't2', amount: 800, category: 'TRANSPORT', note: '西鐵巴士', date: '2026-02-28' },
  { id: 't3', amount: 5000, category: 'SHOPPING', note: '藥妝店', date: '2026-02-28' },
];

const INITIAL_TICKETS: TicketItem[] = [
  { id: '1', type: 'FLIGHT', title: '星宇航空 Starlux', detail: 'JX846 | TPE -> KMJ', time: '07:30 - 10:45' },
  { id: '2', type: 'FLIGHT', title: '星宇航空 Starlux', detail: 'JX847 | KMJ -> TPE', time: '11:55 - 13:20' },
  { id: '3', type: 'HOTEL', title: '相鐵Grand Fresa 熊本飯店', address: '2-2-23,Shimotori,Chuo-ku,熊本,日本', time: '20260925-20260928', Tel: '806-0807' },
  { id: '4', type: 'TRAIN', title: 'JR九州鐵路周遊券', detail: '熊本 <-> 博多', time: '3日券', location: '北部九州' }
];

const INITIAL_PLANNING: PlanningItem[] = [
  // 手提行李
  { id: 'p1', category: '手提行李', subCategory: '重要文件', text: '護照', completed: false },
  { id: 'p2', category: '手提行李', subCategory: '重要文件', text: '護照影本', completed: false },
  { id: 'p3', category: '手提行李', subCategory: '重要文件', text: '大頭照2張', completed: false },
  { id: 'p4', category: '手提行李', subCategory: '重要文件', text: '身分證', completed: false },
  { id: 'p5', category: '手提行李', subCategory: '重要文件', text: '信用卡', completed: false },
  { id: 'p6', category: '手提行李', subCategory: '重要文件', text: '日幣現金', completed: false },
  { id: 'p7', category: '手提行李', subCategory: '重要文件', text: '機票/登機證', completed: false },
  { id: 'p8', category: '手提行李', subCategory: '重要文件', text: '住宿證明', completed: false },
  { id: 'p9', category: '手提行李', subCategory: '機上用品', text: '水壺', completed: false },
  { id: 'p10', category: '手提行李', subCategory: '機上用品', text: '頸枕', completed: false },
  { id: 'p11', category: '手提行李', subCategory: '機上用品', text: '眼罩', completed: false },
  { id: 'p12', category: '手提行李', subCategory: '機上用品', text: '筆', completed: false },
  { id: 'p13', category: '手提行李', subCategory: '3C產品', text: '手機', completed: false },
  { id: 'p14', category: '手提行李', subCategory: '3C產品', text: 'SIM卡', completed: false },
  { id: 'p15', category: '手提行李', subCategory: '3C產品', text: '充電線', completed: false },
  { id: 'p16', category: '手提行李', subCategory: '3C產品', text: '行動電源', completed: false },
  { id: 'p17', category: '手提行李', subCategory: '3C產品', text: '相機', completed: false },
  { id: 'p18', category: '手提行李', subCategory: '3C產品', text: '耳機', completed: false },
  { id: 'p19', category: '手提行李', subCategory: '其他', text: '衛生紙/棉', completed: false },
  { id: 'p20', category: '手提行李', subCategory: '其他', text: '個人藥品', completed: false },
  { id: 'p21', category: '手提行李', subCategory: '其他', text: '乳液等(小於100ml)', completed: false },

  // 托運行李
  { id: 'p22', category: '托運行李', subCategory: '衣物類', text: '外出服', completed: false },
  { id: 'p23', category: '托運行李', subCategory: '衣物類', text: '睡衣', completed: false },
  { id: 'p24', category: '托運行李', subCategory: '衣物類', text: '內衣褲', completed: false },
  { id: 'p25', category: '托運行李', subCategory: '衣物類', text: '襪子', completed: false },
  { id: 'p26', category: '托運行李', subCategory: '衣物類', text: '圍巾', completed: false },
  { id: 'p27', category: '托運行李', subCategory: '衣物類', text: '手套', completed: false },
  { id: 'p28', category: '托運行李', subCategory: '衣物類', text: '拖鞋', completed: false },
  { id: 'p29', category: '托運行李', subCategory: '衣物類', text: '太陽眼鏡', completed: false },
  { id: 'p30', category: '托運行李', subCategory: '衣物類', text: '帽子', completed: false },
  { id: 'p31', category: '托運行李', subCategory: '盥洗類', text: '牙刷', completed: false },
  { id: 'p32', category: '托運行李', subCategory: '盥洗類', text: '牙膏', completed: false },
  { id: 'p33', category: '托運行李', subCategory: '盥洗類', text: '洗發精', completed: false },
  { id: 'p34', category: '托運行李', subCategory: '盥洗類', text: '沐浴乳', completed: false },
  { id: 'p35', category: '托運行李', subCategory: '盥洗類', text: '洗面乳', completed: false },
  { id: 'p36', category: '托運行李', subCategory: '盥洗類', text: '梳子', completed: false },
  { id: 'p37', category: '托運行李', subCategory: '盥洗類', text: '刮鬍刀', completed: false },
  { id: 'p38', category: '托運行李', subCategory: '盥洗類', text: '指甲剪', completed: false },
  { id: 'p39', category: '托運行李', subCategory: '盥洗類', text: '毛巾', completed: false },
  { id: 'p40', category: '托運行李', subCategory: '保養品', text: '防曬乳', completed: false },
  { id: 'p41', category: '托運行李', subCategory: '其他', text: '環保購物袋', completed: false },
  { id: 'p42', category: '托運行李', subCategory: '其他', text: '環保餐具', completed: false },
  { id: 'p43', category: '托運行李', subCategory: '其他', text: '掛勾/摺疊衣架', completed: false },
  { id: 'p44', category: '托運行李', subCategory: '其他', text: '口罩', completed: false },
  { id: 'p45', category: '托運行李', subCategory: '其他', text: '酒精棉片', completed: false },
  { id: 'p46', category: '托運行李', subCategory: '其他', text: '摺疊傘', completed: false },
  { id: 'p47', category: '托運行李', subCategory: '其他', text: '行李吊牌', completed: false },
  { id: 'p48', category: '托運行李', subCategory: '其他', text: '電子秤', completed: false },

  // 注意事項
  { id: 'p49', category: '注意事項', subCategory: '只能手提', text: '行動電源/鋰電池', completed: false },
  { id: 'p50', category: '注意事項', subCategory: '只能手提', text: '打火機', completed: false },
  { id: 'p51', category: '注意事項', subCategory: '只能託運', text: '刀類', completed: false },
  { id: 'p52', category: '注意事項', subCategory: '只能託運', text: '尖銳物品', completed: false },
  { id: 'p53', category: '注意事項', subCategory: '只能託運', text: '單瓶超過100ml液體', completed: false },
  { id: 'p54', category: '注意事項', subCategory: '只能託運', text: '自拍棒/腳架(管徑>1cm,收合>60cm)', completed: false },

  // 必備清單
  { id: 'p55', category: '必備清單', text: '旅遊保險', completed: false },
  { id: 'p56', category: '必備清單', subCategory: 'APP', text: 'Japan Transit Planner', completed: false },
  { id: 'p57', category: '必備清單', subCategory: 'APP', text: '食べログTabelog', completed: false },
  { id: 'p58', category: '必備清單', subCategory: 'APP', text: 'TaxiGO', completed: false },
  { id: 'p59', category: '必備清單', subCategory: 'APP', text: 'Payke', completed: false },
  { id: 'p60', category: '必備清單', subCategory: 'APP', text: 'tenki.jp', completed: false },

  // 必吃清單 & 必買清單
  { id: 'p61', category: '必吃清單', text: '博多拉麵', completed: false },
  { id: 'p62', category: '必吃清單', text: '熊本馬肉刺身', completed: false },
  { id: 'p63', category: '必買清單', text: '明太子相關製品', completed: false },
  { id: 'p64', category: '必買清單', text: '藥妝用品', completed: false },
];

// --- Components ---

const NavItem = ({ active, icon: Icon, label, onClick }: { active: boolean, icon: any, label: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center space-y-0.5 transition-all duration-300 ${active ? 'text-ink scale-110' : 'text-ink/30'}`}
  >
    <Icon size={18} strokeWidth={active ? 2.5 : 1.5} />
    <span className="text-[8px] uppercase tracking-[0.2em] font-accent font-bold">{label}</span>
  </button>
);

const WeatherIcon = ({ condition }: { condition: 'SUN' | 'CLOUD' | 'RAIN' | 'WIND' }) => {
  switch (condition) {
    case 'SUN': return <Sun size={16} className="text-ink/60" />;
    case 'CLOUD': return <Cloud size={16} className="text-ink/60" />;
    case 'RAIN': return <CloudRain size={16} className="text-ink/60" />;
    case 'WIND': return <Wind size={16} className="text-ink/60" />;
    default: return <Sun size={16} className="text-ink/60" />;
  }
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('kyushu_auth') === 'true';
    }
    return false;
  });
  const [currentUser, setCurrentUser] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('kyushu_user') || '';
    }
    return '';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);

  const handleLogin = (member: string) => {
    if (passwordInput === '20260301') {
      setIsAuthenticated(true);
      setCurrentUser(member);
      localStorage.setItem('kyushu_auth', 'true');
      localStorage.setItem('kyushu_user', member);
    } else {
      setAuthError(true);
      setTimeout(() => setAuthError(false), 2000);
    }
  };

  const [activeTab, setActiveTab] = useState<Tab>('JOURNAL');
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [planningItems, setPlanningItems] = useState<PlanningItem[]>(INITIAL_PLANNING);
  const [selectedPlanningCat, setSelectedPlanningCat] = useState('手提行李');
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [isOathExpanded, setIsOathExpanded] = useState(false);
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpenseNote, setNewExpenseNote] = useState('');
  const [newExpenseCat, setNewExpenseCat] = useState<Transaction['category']>('FOOD');
  const [editingTicket, setEditingTicket] = useState<TicketItem | null>(null);
  const [selectedTicketType, setSelectedTicketType] = useState<'FLIGHT' | 'HOTEL' | 'TRAIN'>('FLIGHT');
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [geminiResponse, setGeminiResponse] = useState<string | null>(null);
  const [selectedSpotForGuide, setSelectedSpotForGuide] = useState<string | null>(null);
  const [newPlanningText, setNewPlanningText] = useState('');
  const [selectedTicketForDetail, setSelectedTicketForDetail] = useState<TicketItem | null>(null);

  // --- Handlers ---
  const addPlanningItem = () => {
    if (!newPlanningText.trim()) return;
    const newItem: PlanningItem = {
      id: `p-custom-${Date.now()}`,
      category: selectedPlanningCat,
      text: newPlanningText.trim(),
      completed: false
    };
    setPlanningItems([...planningItems, newItem]);
    setNewPlanningText('');
  };

  const askGeminiGuide = async (spotName: string) => {
    setGeminiLoading(true);
    setSelectedSpotForGuide(spotName);
    setGeminiResponse(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `你是一位專業的九州導遊。請用繁體中文簡短介紹「${spotName}」這個景點的歷史、特色以及旅遊建議（約150字）。`,
      });
      setGeminiResponse(response.text || "抱歉，我現在無法提供導覽。");
    } catch (error) {
      console.error("Gemini Error:", error);
      setGeminiResponse("導覽服務暫時不可用，請稍後再試。");
    } finally {
      setGeminiLoading(false);
    }
  };
  const togglePlanning = (id: string) => {
    setPlanningItems(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const addTransaction = () => {
    if (!newExpenseAmount || isNaN(Number(newExpenseAmount))) return;
    const newTx: Transaction = {
      id: Date.now().toString(),
      amount: Number(newExpenseAmount),
      category: newExpenseCat,
      note: newExpenseNote || '未命名項目',
      date: new Date().toISOString().split('T')[0]
    };
    setTransactions([newTx, ...transactions]);
    setNewExpenseAmount('');
    setNewExpenseNote('');
    setIsAddingExpense(false);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const totalExpense = transactions.reduce((sum, t) => sum + t.amount, 0);



  if (!isAuthenticated) {
    const members = [
      { name: '廷', role: 'CANDID CAPTURER', img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" },
      { name: '佑', role: 'NAP ARCHITECT', img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80" },
      { name: '萱', role: 'CHIEF GlUTTON', img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80" },
      { name: 'ㄗ', role: 'TREASURE SCOUT', img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80" },
    ];

    return (
      <div className="fixed inset-0 z-[100] bg-paper flex flex-col items-center justify-center px-8 paper-texture">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-12 text-center"
        >
          <div className="space-y-4">
            <h1 className="font-display text-5xl tracking-tighter">北九州之旅</h1>
            <p className="font-accent font-bold opacity-30 uppercase tracking-[0.4em] text-xs">Journal Edition 2026</p>
          </div>

          <div className="space-y-6">
            <div className="relative">
              <input 
                type="password" 
                placeholder="請輸入通行密碼"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className={`w-full bg-transparent border-b-2 py-3 text-center font-mono text-2xl tracking-widest focus:outline-none transition-colors ${authError ? 'border-red-500 text-red-500' : 'border-ink/10 focus:border-ink'}`}
              />
              {authError && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[10px] text-red-500 font-bold uppercase tracking-widest mt-2"
                >
                  密碼錯誤，請重新輸入
                </motion.p>
              )}
            </div>

            <div className="space-y-4 pt-4">
              <p className="text-[10px] uppercase tracking-[0.3em] font-accent font-bold opacity-30">請選擇成員身份</p>
              <div className="grid grid-cols-2 gap-4">
                {members.map((m) => (
                  <button
                    key={m.name}
                    onClick={() => handleLogin(m.name)}
                    className="flex flex-col items-center p-4 rounded-2xl border border-ink/5 bg-white shadow-sm hover:shadow-md transition-all active:scale-95"
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden mb-3">
                      <img src={m.img} alt={m.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <span className="font-serif text-lg">{m.name}</span>
                    <span className="text-[8px] opacity-30 font-accent font-bold uppercase tracking-wider mt-1">{m.role}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full max-w-md mx-auto overflow-hidden flex flex-col paper-texture bg-paper">
      
      {/* Header */}
      <header className="px-8 pt-8 pb-4 flex justify-between items-end border-b border-ink/5">
        <div>
          <h1 className="font-display text-3xl tracking-tighter leading-none">北九州之旅</h1>
          <div className="flex items-center space-x-2 mt-1">
            <p className="font-accent font-bold opacity-30 uppercase tracking-[0.3em] text-[10px]">Journal Edition</p>
            <span className="w-1 h-1 rounded-full bg-ink/20" />
            <p className="font-serif text-[10px] opacity-40">旅客：{currentUser}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-serif text-sm">September 2026</p>
          <p className="text-[10px] uppercase tracking-widest font-accent font-bold opacity-30">25 to 28</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto hide-scrollbar">
        {activeTab === 'JOURNAL' && (
          <div className="sticky top-0 z-30 bg-paper/90 backdrop-blur-md border-b border-ink/5 px-8 pt-4 pb-2">
            <div className="flex space-x-8 overflow-x-auto hide-scrollbar">
              {JOURNAL_DATA.map((day, idx) => (
                <button
                  key={day.day}
                  onClick={() => setSelectedDayIndex(idx)}
                  className={`flex-shrink-0 flex flex-col items-start transition-all duration-300 ${selectedDayIndex === idx ? 'opacity-100' : 'opacity-20'}`}
                >
                  <span className="text-[11px] uppercase tracking-[0.5em] font-accent font-bold mb-1">Day {day.day}</span>
                  <span className="font-display text-lg whitespace-nowrap">{day.title}</span>
                  {selectedDayIndex === idx && (
                    <motion.div layoutId="activeDay" className="h-[2px] w-full bg-ink mt-2" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="px-6 py-8">
          <AnimatePresence mode="wait">
            {activeTab === 'JOURNAL' && (
              <motion.div 
                key="journal"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col h-full"
              >
                {/* Vertical Itinerary Content */}
                <AnimatePresence mode="wait">
                <motion.div
                  key={selectedDayIndex}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8 pb-12"
                >
                  <div className="relative aspect-[16/9] overflow-hidden rounded-sm">
                    <img 
                      src={JOURNAL_DATA[selectedDayIndex].image} 
                      alt={JOURNAL_DATA[selectedDayIndex].title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-paper/40 to-transparent" />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-baseline">
                      <h2 className="font-display text-2xl">{JOURNAL_DATA[selectedDayIndex].title}</h2>
                      <span className="text-[10px] uppercase tracking-widest opacity-30 font-accent font-bold">{JOURNAL_DATA[selectedDayIndex].subtitle}</span>
                    </div>
                    
                    <p className="text-base leading-relaxed font-light opacity-80 border-l-2 border-ink/10 pl-4">
                      "{JOURNAL_DATA[selectedDayIndex].description}"
                    </p>

                    {/* Hourly Weather Section */}
                    <div className="pt-2">
                      <div className="flex space-x-6 overflow-x-auto hide-scrollbar py-4 border-y border-ink/5">
                        {JOURNAL_DATA[selectedDayIndex].weather.map((w, idx) => (
                          <div key={idx} className="flex flex-col items-center space-y-2 flex-shrink-0">
                            <span className="text-[10px] font-mono opacity-40">{w.time}</span>
                            <WeatherIcon condition={w.condition} />
                            <span className="text-sm font-serif">{w.temp}°</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4">
                      <h3 className="text-[10px] uppercase tracking-[0.3em] font-accent font-bold opacity-30 mb-6">Itinerary Details</h3>
                      <div className="space-y-8 relative">
                        {/* Vertical Line */}
                        <div className="absolute left-[11px] top-2 bottom-2 w-[1px] bg-ink/10" />
                        
                        {JOURNAL_DATA[selectedDayIndex].itinerary.map((item, idx) => (
                          <div key={idx} className="flex items-start space-x-4 relative">
                            <div className="mt-1.5 w-[22px] h-[22px] rounded-full bg-paper border border-ink/20 flex items-center justify-center z-10 flex-shrink-0">
                              <div className="w-1.5 h-1.5 rounded-full bg-ink" />
                            </div>
                            <div className="flex-1 flex space-x-4 items-start pb-8">
                              {item.image ? (
                                <div className="w-20 h-20 rounded-sm overflow-hidden flex-shrink-0 border border-ink/5">
                                  <img 
                                    src={item.image} 
                                    alt={item.name} 
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                              ) : (
                                <div className="w-20 h-20 rounded-sm bg-ink/[0.02] flex items-center justify-center flex-shrink-0 border border-ink/5">
                                  {item.type === 'TRANSPORT' && <Plane size={24} className="opacity-10" />}
                                  {item.type === 'FOOD' && <Utensils size={24} className="opacity-10" />}
                                  {item.type === 'STAY' && <Hotel size={24} className="opacity-10" />}
                                  {item.type === 'SHOPPING' && <ShoppingBag size={24} className="opacity-10" />}
                                  {item.type === 'SPOT' && <Map size={24} className="opacity-10" />}
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-[9px] font-mono opacity-40">{item.time}</span>
                                  <span className="text-[8px] uppercase tracking-widest font-accent font-bold opacity-20 px-1.5 py-0.5 border border-ink/10 rounded-full">
                                    {item.type}
                                  </span>
                                </div>
                                <h4 className="font-display text-xl leading-tight">{item.name}</h4>
                                {item.query && (
                                  <div className="flex space-x-2 mt-3">
                                    <a 
                                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.query)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-2 bg-ink/5 rounded-full hover:bg-ink/10 transition-colors"
                                      title="Google Maps"
                                    >
                                      <Map size={14} className="text-ink/60" />
                                    </a>
                                    <button 
                                      onClick={() => askGeminiGuide(item.name)}
                                      className="p-2 bg-ink/5 rounded-full hover:bg-ink/10 transition-colors"
                                      title="Gemini 導遊"
                                    >
                                      <Sparkles size={14} className="text-ink/60" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === 'TICKET' && (
            <motion.div 
              key="ticket"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="px-2">
                <h3 className="text-[11px] uppercase tracking-[0.3em] font-accent font-bold opacity-30 mb-6">Travel Documents</h3>
                
                {/* Horizontal Category Selector */}
                <div className="flex space-x-8 overflow-x-auto hide-scrollbar pb-4 mb-6 border-b border-ink/5">
                  {[
                    { id: 'FLIGHT', label: '機票' },
                    { id: 'HOTEL', label: '住宿' },
                    { id: 'TRAIN', label: '交通' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedTicketType(cat.id as any)}
                      className={`flex-shrink-0 flex flex-col items-center transition-all duration-300 ${selectedTicketType === cat.id ? 'opacity-100 scale-105' : 'opacity-30'}`}
                    >
                      <span className="text-[11px] tracking-widest font-accent font-bold whitespace-nowrap">{cat.label}</span>
                      {selectedTicketType === cat.id && (
                        <motion.div 
                          layoutId="activeTicketCat"
                          className="h-[2px] w-full bg-ink mt-1"
                        />
                      )}
                    </button>
                  ))}
                </div>

                  <div className="space-y-4">
                    {INITIAL_TICKETS.filter(t => t.type === selectedTicketType).length > 0 ? (
                      INITIAL_TICKETS.filter(t => t.type === selectedTicketType).map(ticket => (
                        <div 
                          key={ticket.id}
                          className="relative bg-white border border-ink/10 transition-all duration-300 group overflow-hidden rounded-lg flex flex-col"
                        >
                          {/* Header with Icon and Title */}
                          <div className="p-5 flex justify-between items-start border-b border-ink/[0.03]">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-ink/5 text-ink rounded flex items-center justify-center">
                                {ticket.type === 'FLIGHT' && <Plane size={16} />}
                                {ticket.type === 'TRAIN' && <Train size={16} />}
                                {ticket.type === 'HOTEL' && <Hotel size={16} />}
                              </div>
                              <div>
                                <span className="text-[8px] uppercase tracking-[0.2em] font-accent font-bold opacity-40 block">
                                  {ticket.type === 'FLIGHT' && 'Flight'}
                                  {ticket.type === 'HOTEL' && 'Stay'}
                                  {ticket.type === 'TRAIN' && 'Pass'}
                                </span>
                                <h4 className="font-sans font-bold text-base text-ink">{ticket.title}</h4>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] font-mono opacity-30 block">#{ticket.id}</span>
                              <div className="flex items-center space-x-1 justify-end mt-0.5">
                                <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                <span className="text-[8px] uppercase font-accent font-bold text-emerald-600/70">Confirmed</span>
                              </div>
                            </div>
                          </div>

                          {/* Content Area */}
                          <div className="p-5 space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                              <div>
                                <span className="text-[8px] uppercase tracking-widest font-accent font-bold opacity-20 block mb-1">
                                  {ticket.type === 'HOTEL' ? 'Location' : 'Route/Info'}
                                </span>
                                <p className="text-xs font-medium font-sans leading-relaxed">
                                  {ticket.type === 'HOTEL' ? ticket.address : ticket.detail}
                                </p>
                                {ticket.Tel && (
                                  <p className="text-[10px] font-mono opacity-40 mt-1">T: {ticket.Tel}</p>
                                )}
                              </div>
                              
                              <div className="flex justify-between items-end">
                                <div>
                                  <span className="text-[8px] uppercase tracking-widest font-accent font-bold opacity-20 block mb-1">
                                    {ticket.type === 'HOTEL' ? 'Period' : (ticket.type === 'TRAIN' && ticket.location ? 'Region' : 'Time')}
                                  </span>
                                  <p className="text-xs font-mono font-medium">
                                    {ticket.type === 'TRAIN' && ticket.location ? ticket.location : ticket.time}
                                  </p>
                                  {(ticket.type === 'TRAIN' && ticket.location) && (
                                    <p className="text-[10px] font-mono opacity-40">{ticket.time}</p>
                                  )}
                                </div>
                                
                                <button 
                                  onClick={() => setSelectedTicketForDetail(ticket)}
                                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-ink/5 hover:bg-ink/10 rounded text-[9px] uppercase tracking-widest font-accent font-bold transition-colors"
                                >
                                  <span>Details</span>
                                  <ChevronRight size={10} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="py-20 text-center opacity-20 font-serif">
                      目前此分類尚無票券
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-12 border border-dashed border-ink/10 rounded-xl text-center opacity-20">
                <p className="text-[10px] uppercase tracking-[0.5em] font-bold">End of Documents</p>
              </div>
            </motion.div>
          )}

          {activeTab === 'PLANNING' && (
            <motion.div 
              key="planning"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col h-full"
            >
              {/* Horizontal Category Selector */}
              <div className="flex space-x-6 overflow-x-auto hide-scrollbar pt-2 pb-6 mb-8 border-b border-ink/5 px-2">
                {['手提行李', '托運行李', '必備清單', '注意事項', '必吃清單', '必買清單'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedPlanningCat(cat)}
                    className={`flex-shrink-0 flex flex-col items-center transition-all duration-300 ${selectedPlanningCat === cat ? 'opacity-100 scale-105' : 'opacity-30'}`}
                  >
                    <span className="text-[11px] tracking-widest font-accent font-bold whitespace-nowrap">{cat}</span>
                    {selectedPlanningCat === cat && (
                      <motion.div 
                        layoutId="activePlanningCat"
                        className="h-[2px] w-full bg-ink mt-1"
                      />
                    )}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div className="space-y-6">
                  {/* Group by subCategory */}
                  {Array.from(new Set(planningItems.filter(i => i.category === selectedPlanningCat).map(i => i.subCategory))).map(subCat => (
                    <div key={subCat || 'General'} className="space-y-2">
                      {subCat && (
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-[9px] uppercase tracking-[0.3em] font-accent font-bold opacity-20 px-1">
                            {subCat}
                          </h4>
                          <div className="h-[1px] flex-1 bg-ink/5" />
                        </div>
                      )}
                      <div className="grid grid-cols-1 gap-0.5">
                        {planningItems.filter(i => i.category === selectedPlanningCat && i.subCategory === subCat).map(item => (
                          <div 
                            key={item.id}
                            onClick={() => togglePlanning(item.id)}
                            className={`flex items-center space-x-3 cursor-pointer group p-1.5 rounded-sm transition-all duration-300 ${item.completed ? 'opacity-40' : 'hover:bg-ink/[0.03]'}`}
                          >
                            <div className={`w-3.5 h-3.5 border border-ink/20 flex items-center justify-center transition-colors ${item.completed ? 'bg-ink border-ink' : 'group-hover:border-ink'}`}>
                              {item.completed && <Check size={8} className="text-paper" />}
                            </div>
                            <span className={`text-sm transition-all duration-300 font-serif ${item.completed ? 'line-through' : 'opacity-70 font-medium'}`}>
                              {item.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {planningItems.filter(i => i.category === selectedPlanningCat).length === 0 && (
                    <div className="py-12 text-center opacity-20 font-serif">
                      目前此分類尚無項目
                    </div>
                  )}

                  {/* Add New Item Input */}
                  <div className="pt-8 mt-4 border-t border-ink/5">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="text"
                        value={newPlanningText}
                        onChange={(e) => setNewPlanningText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addPlanningItem()}
                        placeholder={`新增${selectedPlanningCat}項目...`}
                        className="flex-1 bg-ink/[0.03] border-none rounded-sm px-4 py-2 text-sm font-serif focus:ring-1 focus:ring-ink/10 outline-none placeholder:opacity-30"
                      />
                      <button 
                        onClick={addPlanningItem}
                        className="bg-ink text-paper text-[10px] uppercase tracking-widest font-accent font-bold px-4 py-2 rounded-sm hover:bg-ink/90 transition-colors"
                      >
                        新增
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'EXPENSE' && (
            <motion.div 
              key="expense"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full flex flex-col space-y-6"
            >
              {/* Summary Header */}
              <div className="bg-white p-8 rounded-lg shadow-sm border border-ink/5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] uppercase tracking-[0.4em] font-accent font-bold opacity-30">Total Budget Spent</span>
                    <div className="flex items-baseline space-x-2 mt-1">
                      <span className="text-xl font-display">¥</span>
                      <span className="text-4xl font-display tracking-tighter">{totalExpense.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase tracking-[0.4em] font-accent font-bold opacity-30">Approx. TWD</span>
                    <p className="text-lg font-serif mt-1">≈ ${(totalExpense * 0.21).toFixed(0)}</p>
                  </div>
                </div>
              </div>

              {/* Transaction List */}
              <div className="flex-1 overflow-y-auto hide-scrollbar space-y-4">
                <div className="flex justify-between items-center px-2 mb-4">
                  <h3 className="text-[11px] uppercase tracking-[0.3em] font-accent font-bold opacity-30">Recent Transactions</h3>
                  <button 
                    onClick={() => setIsAddingExpense(true)}
                    className="text-[9px] uppercase tracking-widest font-accent font-bold text-ink bg-ink/5 px-3 py-1 rounded-full"
                  >
                    + Add New
                  </button>
                </div>
                
                {transactions.length === 0 ? (
                  <div className="py-20 text-center opacity-20 font-serif">
                    No records yet. Start your journey!
                  </div>
                ) : (
                  transactions.map(t => (
                    <div key={t.id} className="bg-white/50 p-4 rounded-lg flex justify-between items-center border border-ink/5 group">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-ink/5 flex items-center justify-center text-[9px] font-accent font-bold opacity-30">
                          {t.category.slice(0, 1)}
                        </div>
                        <div>
                          <p className="font-serif text-lg leading-tight">{t.note}</p>
                          <p className="text-[9px] uppercase tracking-widest font-accent font-bold opacity-20 mt-1">{t.category} • {t.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="font-display text-lg">¥{t.amount.toLocaleString()}</span>
                        <button 
                          onClick={() => deleteTransaction(t.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-ink/20 hover:text-ink"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Expense Modal */}
              <AnimatePresence>
                {isAddingExpense && (
                  <>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsAddingExpense(false)}
                      className="fixed inset-0 z-[100] bg-ink/40 backdrop-blur-sm"
                    />
                    <motion.div 
                      initial={{ y: '100%' }}
                      animate={{ y: 0 }}
                      exit={{ y: '100%' }}
                      className="fixed bottom-0 left-0 right-0 z-[110] bg-paper rounded-t-3xl p-8 max-w-md mx-auto"
                    >
                      <div className="w-12 h-1 bg-ink/10 rounded-full mx-auto mb-8" />
                      <h3 className="font-display text-3xl mb-8">New Record</h3>
                      
                      <div className="space-y-6">
                        <div>
                          <label className="text-[9px] uppercase tracking-[0.3em] font-accent font-bold opacity-30 block mb-2">Amount (JPY)</label>
                          <input 
                            type="number" 
                            value={newExpenseAmount}
                            onChange={(e) => setNewExpenseAmount(e.target.value)}
                            placeholder="0"
                            className="w-full bg-transparent border-b border-ink/10 py-2 text-4xl font-display focus:border-ink outline-none transition-colors"
                            autoFocus
                          />
                        </div>
                        
                        <div>
                          <label className="text-[9px] uppercase tracking-[0.3em] font-accent font-bold opacity-30 block mb-2">Category</label>
                          <div className="flex flex-wrap gap-2">
                            {(['FOOD', 'TRANSPORT', 'SHOPPING', 'STAY', 'OTHER'] as const).map(cat => (
                              <button
                                key={cat}
                                onClick={() => setNewExpenseCat(cat)}
                                className={`px-4 py-2 rounded-full text-[9px] font-accent font-bold tracking-widest transition-all ${newExpenseCat === cat ? 'bg-ink text-paper' : 'bg-ink/5 opacity-40'}`}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-[9px] uppercase tracking-[0.3em] font-accent font-bold opacity-30 block mb-2">Note</label>
                          <input 
                            type="text" 
                            value={newExpenseNote}
                            onChange={(e) => setNewExpenseNote(e.target.value)}
                            placeholder="What did you buy?"
                            className="w-full bg-transparent border-b border-ink/10 py-2 text-lg font-serif focus:border-ink outline-none transition-colors"
                          />
                        </div>

                        <div className="pt-6 flex space-x-4">
                          <button 
                            onClick={() => setIsAddingExpense(false)}
                            className="flex-1 py-4 border border-ink/10 rounded-sm font-accent font-bold uppercase tracking-widest text-[9px] opacity-30"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={addTransaction}
                            className="flex-2 py-4 bg-ink text-paper rounded-sm font-accent font-bold uppercase tracking-widest text-[10px]"
                          >
                            Save Record
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === 'CREDITS' && (
            <motion.div 
              key="credits"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col overflow-y-auto hide-scrollbar px-2 py-12 space-y-16 items-center text-center"
            >
              <div className="space-y-2">
                <h3 className="text-[10px] uppercase tracking-[0.4em] font-accent font-bold opacity-30">Production</h3>
                <h2 className="font-display text-3xl">KyushuJournal</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-x-12 gap-y-10">
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-16 h-16 rounded-full overflow-hidden border border-ink/5 shadow-sm">
                    {/* 廷的頭像 */}
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" alt="廷" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest font-accent font-bold opacity-30 mb-0.5">CANDID CAPTURER</p>
                    <p className="font-serif text-lg">廷</p>
                  </div>
                </div>
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-16 h-16 rounded-full overflow-hidden border border-ink/5 shadow-sm">
                    {/* 佑的頭像 */}
                    <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80" alt="佑" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest font-accent font-bold opacity-30 mb-0.5">NAP ARCHITECT</p>
                    <p className="font-serif text-lg">佑</p>
                  </div>
                </div>
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-16 h-16 rounded-full overflow-hidden border border-ink/5 shadow-sm">
                    {/* 萱的頭像 */}
                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80" alt="萱" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest font-accent font-bold opacity-30 mb-0.5">CHIEF GlUTTON</p>
                    <p className="font-serif text-lg">萱</p>
                  </div>
                </div>
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-16 h-16 rounded-full overflow-hidden border border-ink/5 shadow-sm">
                    {/* ㄗ的頭像 */}
                    <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80" alt="ㄗ" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest font-accent font-bold opacity-30 mb-0.5">TREASURE SCOUT</p>
                    <p className="font-serif text-lg">ㄗ</p>
                  </div>
                </div>
              </div>

              {/* Travel Oath Card */}
              <div className="w-full max-w-[320px]">
                <motion.button 
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsOathExpanded(!isOathExpanded)}
                  className={`w-full flex items-center justify-center bg-white border border-ink/5 shadow-sm py-4 px-8 transition-all duration-300 ${isOathExpanded ? 'rounded-t-2xl border-b-0' : 'rounded-full'}`}
                >
                  <span className={`font-accent font-bold uppercase tracking-[0.4em] text-xs transition-opacity duration-300 ${isOathExpanded ? 'opacity-100' : 'opacity-40'}`}>旅遊宣誓</span>
                </motion.button>

                <AnimatePresence>
                  {isOathExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                      className="overflow-hidden bg-white border border-ink/5 border-t-0 shadow-sm rounded-b-2xl"
                    >
                      <div className="p-8 pt-6 space-y-8 text-left">
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <p className="text-[10px] uppercase tracking-widest font-accent font-bold opacity-30">隨遇而安</p>
                            <p className="text-sm font-serif leading-relaxed opacity-80">
                              行程隨時可彈性調整，重點是開心出門、愉快回家。
                            </p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-[10px] uppercase tracking-widest font-accent font-bold opacity-30">解決優先</p>
                            <p className="text-sm font-serif leading-relaxed opacity-80">
                              遇到突發狀況先處理問題，我們是最強團隊，絕不互找戰犯。
                            </p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-[10px] uppercase tracking-widest font-accent font-bold opacity-30">正念旅行</p>
                            <p className="text-sm font-serif leading-relaxed opacity-80">
                              封印「好難吃、好無聊、好貴」三大地雷金句，用體驗代替抱怨。
                            </p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-[10px] uppercase tracking-widest font-accent font-bold opacity-30">守時相伴</p>
                            <p className="text-sm font-serif leading-relaxed opacity-80">
                              尊重彼此時間，約好集合就準時，不讓旅伴在冷風中苦等。
                            </p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-[10px] uppercase tracking-widest font-accent font-bold opacity-30">直球對決</p>
                            <p className="text-sm font-serif leading-relaxed opacity-80">
                              想拍照、想吃東西、想上廁所請大聲說出，我們不玩猜心遊戲！
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="w-full max-w-[280px] space-y-8 pt-8 border-t border-ink/5">
                <h3 className="text-[10px] uppercase tracking-[0.4em] font-accent font-bold opacity-30">Emergency Contacts</h3>
                
                <div className="space-y-6 text-left">
                  <div className="flex justify-between items-end border-b border-ink/5 pb-2">
                    <span className="text-[10px] font-accent font-bold opacity-40 uppercase tracking-widest">警察 (事故、犯罪)</span>
                    <span className="font-display text-2xl leading-none">110</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-ink/5 pb-2">
                    <span className="text-[10px] font-accent font-bold opacity-40 uppercase tracking-widest">火災、救護車 (急病)</span>
                    <span className="font-display text-2xl leading-none">119</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-accent font-bold opacity-40 uppercase tracking-widest block">日本旅遊專線 (24H中文)</span>
                    <span className="font-display text-xl leading-none block">050-3816-2787</span>
                  </div>
                  
                  <div className="pt-4 space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-accent font-bold opacity-40 uppercase tracking-widest block">駐外辦事處 (大阪)</span>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-[9px] font-accent font-bold opacity-20 uppercase tracking-widest">急難救助</span>
                        <span className="font-display text-base">090-8794-4568</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-[9px] font-accent font-bold opacity-20 uppercase tracking-widest">辦公室</span>
                        <span className="font-display text-base">06-6227-8623</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <span className="text-[10px] font-accent font-bold opacity-40 uppercase tracking-widest block">外交部緊急服務專線</span>
                      <span className="font-display text-lg leading-none block">+886-3-398-5807</span>
                      <span className="text-[8px] font-accent font-bold opacity-20 uppercase tracking-widest block">24小時服務</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 pb-12 flex flex-col items-center space-y-8">
                <p className="text-[10px] font-accent font-bold opacity-20 max-w-[200px] leading-relaxed uppercase tracking-widest text-center">
                  Crafted with passion for the island of Kyushu. 
                  All rights reserved 2026.
                </p>
                
                <button 
                  onClick={() => {
                    localStorage.removeItem('kyushu_auth');
                    localStorage.removeItem('kyushu_user');
                    window.location.reload();
                  }}
                  className="px-6 py-2 border border-ink/10 rounded-full text-[9px] uppercase tracking-[0.3em] font-accent font-bold opacity-30 hover:opacity-100 hover:bg-ink/5 transition-all active:scale-95"
                >
                  登出系統 / 切換成員
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </main>

      {/* Navigation */}
      <nav className="h-16 border-t border-ink/5 px-8 flex justify-between items-center bg-paper/80 backdrop-blur-md">
        <NavItem active={activeTab === 'JOURNAL'} icon={Book} label="Journal" onClick={() => setActiveTab('JOURNAL')} />
        <NavItem active={activeTab === 'TICKET'} icon={Ticket} label="Ticket" onClick={() => setActiveTab('TICKET')} />
        <NavItem active={activeTab === 'PLANNING'} icon={ClipboardList} label="Plan" onClick={() => setActiveTab('PLANNING')} />
        <NavItem active={activeTab === 'EXPENSE'} icon={Calculator} label="Cost" onClick={() => setActiveTab('EXPENSE')} />
        <NavItem active={activeTab === 'CREDITS'} icon={Users} label="Credits" onClick={() => setActiveTab('CREDITS')} />
      </nav>

      {/* Gemini Guide Modal */}
      <AnimatePresence>
        {selectedSpotForGuide && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSpotForGuide(null)}
              className="fixed inset-0 z-[80] bg-ink/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="fixed bottom-0 left-0 right-0 z-[90] bg-paper rounded-t-3xl p-8 max-w-md mx-auto max-h-[80vh] overflow-y-auto hide-scrollbar"
            >
              <div className="w-12 h-1 bg-ink/10 rounded-full mx-auto mb-8" />
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-serif text-3xl">{selectedSpotForGuide}</h3>
                  <p className="text-[10px] uppercase tracking-widest font-bold opacity-40 mt-1">Gemini AI Tour Guide</p>
                </div>
                <button onClick={() => setSelectedSpotForGuide(null)} className="p-2 bg-ink/5 rounded-full">
                  <X size={16} />
                </button>
              </div>

              <div className="prose prose-sm font-light leading-relaxed text-ink/80">
                {geminiLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <Loader2 className="animate-spin text-ink/20" size={32} />
                    <p className="text-xs uppercase tracking-widest font-bold opacity-40">正在連線至導遊系統...</p>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="whitespace-pre-wrap"
                  >
                    {geminiResponse}
                  </motion.div>
                )}
              </div>

              {!geminiLoading && (
                <button 
                  onClick={() => setSelectedSpotForGuide(null)}
                  className="w-full mt-10 py-4 border border-ink/10 rounded-sm font-bold uppercase tracking-widest text-[10px] hover:bg-ink/5 transition-colors"
                >
                  關閉導覽
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Ticket Detail Modal */}
      <AnimatePresence>
        {selectedTicketForDetail && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTicketForDetail(null)}
              className="fixed inset-0 z-[90] bg-ink/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] w-[90%] max-w-sm bg-paper p-8 rounded-2xl shadow-2xl border border-ink/5"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.4em] font-accent font-bold opacity-30">Ticket Details</span>
                    <h2 className="font-display text-3xl mt-1">{selectedTicketForDetail.title}</h2>
                  </div>
                  <button onClick={() => setSelectedTicketForDetail(null)} className="p-2 opacity-30 hover:opacity-100">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="space-y-4 font-serif text-sm opacity-80 leading-relaxed">
                  <p>這是一張已確認的 {selectedTicketForDetail.type === 'FLIGHT' ? '登機證' : selectedTicketForDetail.type === 'HOTEL' ? '住宿憑證' : '交通票券'}。</p>
                  <div className="bg-ink/[0.03] p-4 rounded-lg space-y-2 font-mono text-xs">
                    <p>ID: KYO-00{selectedTicketForDetail.id}</p>
                    <p>STATUS: VERIFIED</p>
                    <p>HOLDER: {currentUser}</p>
                    {selectedTicketForDetail.address && <p>ADDR: {selectedTicketForDetail.address}</p>}
                    {selectedTicketForDetail.Tel && <p>TEL: {selectedTicketForDetail.Tel}</p>}
                    {selectedTicketForDetail.detail && <p>INFO: {selectedTicketForDetail.detail}</p>}
                    {selectedTicketForDetail.time && <p>TIME: {selectedTicketForDetail.time}</p>}
                  </div>
                  <p className="text-[10px] uppercase tracking-widest opacity-40 text-center pt-4">
                    Scan QR code at the counter for service.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
