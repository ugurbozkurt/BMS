"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { deleteCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import { 
  BarChart3, 
  Users, 
  Package, 
  DollarSign, 
  ShoppingCart, 
  AlertCircle,
  Bell,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Filter,
  Download,
  Menu,
  Home as HomeIcon,
  Boxes,
  ClipboardList,
  Settings,
  TrendingUp,
  Truck,
  FileText,
  ChevronDown,
  Sun,
  Moon,
  ChevronUp,
  LogOut
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useState, useMemo, useRef, useCallback, use } from "react";

// Para formatı için yardımcı fonksiyon
const formatTableCurrency = (amount: number) => {
  return `₺${amount.toLocaleString('tr-TR', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

// Örnek sipariş verisi oluşturan yardımcı fonksiyon
const generateOrders = (count: number) => {
  // Son 12 ayı kapsayan tarih aralığı oluştur
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setMonth(startDate.getMonth() - 12);

  return Array.from({ length: count }, (_, i) => {
    // Rastgele bir tarih oluştur (son 12 ay içinde)
    const orderDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
    
    // Ay bazlı farklı miktarlar için çarpanlar (bazı aylar daha yüksek cirolu olsun)
    const monthMultiplier = {
      0: 1.5,  // Ocak
      1: 0.8,  // Şubat
      2: 1.2,  // Mart
      3: 1.0,  // Nisan
      4: 1.3,  // Mayıs
      5: 1.6,  // Haziran
      6: 1.8,  // Temmuz
      7: 2.0,  // Ağustos
      8: 1.4,  // Eylül
      9: 1.1,  // Ekim
      10: 0.9, // Kasım
      11: 1.7  // Aralık
    }[orderDate.getMonth()] || 1;

    // Rastgele bir miktar oluştur (ay çarpanını kullanarak)
    const baseAmount = Math.floor(Math.random() * 50000) + 5000; // 5000-55000 arası
    const amount = (baseAmount * monthMultiplier).toFixed(2);

    return {
      id: i + 1,
      orderNumber: `#${(Math.random() * 10000).toFixed(0)}`,
      customerName: `Müşteri ${i + 1}`,
      amount: amount,
      status: ['Hazırlanıyor', 'Tamamlandı', 'İptal Edildi', 'Kargoda'][Math.floor(Math.random() * 4)],
      productCount: Math.floor(Math.random() * 10) + 1,
      orderDate: orderDate.toLocaleDateString('tr-TR'),
      deliveryDate: new Date(orderDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString('tr-TR'),
      quantity: Math.floor(Math.random() * 50) + 1,
      totalAmount: amount,
      paymentStatus: ['Ödendi', 'Beklemede', 'İptal Edildi'][Math.floor(Math.random() * 3)],
      shippingAddress: `Adres ${i + 1}, İstanbul`
    };
  });
};

// Sütun genişliği için tip tanımı
interface ColumnWidth {
  [key: string]: number;
}

// Menü öğeleri için tip tanımı
interface MenuItem {
  title: string;
  icon: React.ReactNode;
  path?: string;
  submenu?: {
    title: string;
    path: string;
  }[];
}

// Son 7 günün verilerini hazırlayan fonksiyon
const getLastSevenDaysData = (orders: any[]) => {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toLocaleDateString('tr-TR');
  }).reverse();

  return last7Days.map(date => {
    const dayOrders = orders.filter(order => order.orderDate === date);
    const totalAmount = dayOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
    return {
      date,
      orderCount: dayOrders.length,
      totalAmount
    };
  });
};

// Aylık ciro verilerini hazırlayan fonksiyon
const getMonthlyRevenueData = (orders: any[]) => {
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];
  
  const currentDate = new Date();
  const last12Months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    return {
      month: months[date.getMonth()],
      year: date.getFullYear(),
      monthIndex: date.getMonth(),
      fullMonth: `${months[date.getMonth()]} ${date.getFullYear()}`
    };
  }).reverse();

  return last12Months.map(monthData => {
    const monthOrders = orders.filter(order => {
      const orderDate = new Date(order.orderDate.split('.').reverse().join('-'));
      return orderDate.getMonth() === monthData.monthIndex && 
             orderDate.getFullYear() === monthData.year;
    });

    const totalRevenue = monthOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
    const orderCount = monthOrders.length;

    return {
      month: monthData.fullMonth,
      revenue: totalRevenue,
      orderCount
    };
  });
};

const formatCurrency = (amount: number) => {
  if (amount >= 1000000) {
    return `₺${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `₺${(amount / 1000).toFixed(1)}B`;
  }
  return `₺${amount.toFixed(0)}`;
};

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const [orderSearchTerm, setOrderSearchTerm] = useState("");
  const [menuSearchTerm, setMenuSearchTerm] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedPaymentStatuses, setSelectedPaymentStatuses] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const ordersPerPage = 10;
  const orders = generateOrders(100);

  // Sütun genişlikleri için state
  const [columnWidths, setColumnWidths] = useState<ColumnWidth>({
    orderNumber: 120,
    customer: 150,
    orderDate: 120,
    deliveryDate: 120,
    quantity: 100,
    amount: 120,
    status: 120,
    payment: 120,
    address: 200
  });

  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const resizeStartX = useRef<number>(0);
  const startWidth = useRef<number>(0);

  const handleResizeStart = useCallback((e: React.MouseEvent, columnId: string) => {
    e.preventDefault();
    setResizingColumn(columnId);
    resizeStartX.current = e.clientX;
    startWidth.current = columnWidths[columnId];

    const handleResizeMove = (e: MouseEvent) => {
      if (resizingColumn) {
        const diff = e.clientX - resizeStartX.current;
        const newWidth = Math.max(50, startWidth.current + diff);
        setColumnWidths(prev => ({
          ...prev,
          [columnId]: newWidth
        }));
      }
    };

    const handleResizeEnd = () => {
      setResizingColumn(null);
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };

    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  }, [resizingColumn, columnWidths]);

  // Sıralama fonksiyonu
  const sortData = (data: any[], key: string, direction: 'asc' | 'desc') => {
    return [...data].sort((a, b) => {
      let aValue = key.includes('.') ? key.split('.').reduce((obj, key) => obj[key], a) : a[key];
      let bValue = key.includes('.') ? key.split('.').reduce((obj, key) => obj[key], b) : b[key];

      // Sayısal değerler için
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Tarih değerleri için
      if (key === 'orderDate' || key === 'deliveryDate') {
        const dateA = new Date(aValue.split('.').reverse().join('-'));
        const dateB = new Date(bValue.split('.').reverse().join('-'));
        return direction === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
      }

      // Para birimi değerleri için
      if (key === 'totalAmount') {
        return direction === 'asc' ? parseFloat(aValue) - parseFloat(bValue) : parseFloat(bValue) - parseFloat(aValue);
      }

      // String değerler için
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return direction === 'asc' 
          ? aValue.localeCompare(bValue, 'tr-TR') 
          : bValue.localeCompare(aValue, 'tr-TR');
      }

      return 0;
    });
  };

  // Sıralama işleyicisi
  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return { key, direction: 'asc' };
    });
    setCurrentPage(1); // Sıralama değiştiğinde ilk sayfaya dön
  };

  // Sıralama ikonu bileşeni
  const SortIcon = ({ column }: { column: string }) => {
    if (sortConfig?.key !== column) {
      return (
        <ChevronDown className="h-4 w-4 text-gray-400 ml-1" />
      );
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronDown className="h-4 w-4 text-primary ml-1" />
    ) : (
      <ChevronUp className="h-4 w-4 text-primary ml-1" />
    );
  };

  // Sipariş filtreleme fonksiyonu
  const filteredOrders = useMemo(() => {
    let filtered = orders.filter(order => {
      const matchesSearch = !orderSearchTerm || 
        order.orderNumber.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
        order.shippingAddress.toLowerCase().includes(orderSearchTerm.toLowerCase());

      const matchesStatus = selectedStatuses.length === 0 || 
        selectedStatuses.includes(order.status);

      const matchesPayment = selectedPaymentStatuses.length === 0 || 
        selectedPaymentStatuses.includes(order.paymentStatus);

      return matchesSearch && matchesStatus && matchesPayment;
    });

    // Sıralama uygula
    if (sortConfig) {
      filtered = sortData(filtered, sortConfig.key, sortConfig.direction);
    }

    return filtered;
  }, [orders, orderSearchTerm, selectedStatuses, selectedPaymentStatuses, sortConfig]);

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  
  // Mevcut sayfadaki siparişleri al
  const getCurrentPageOrders = useCallback(() => {
    const startIndex = (currentPage - 1) * ordersPerPage;
    return filteredOrders.slice(startIndex, startIndex + ordersPerPage);
  }, [currentPage, filteredOrders, ordersPerPage]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Hazırlanıyor': return 'bg-yellow-100 text-yellow-800';
      case 'Tamamlandı': return 'bg-green-100 text-green-800';
      case 'İptal Edildi': return 'bg-red-100 text-red-800';
      case 'Kargoda': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'Ödendi': return 'text-green-600';
      case 'Beklemede': return 'text-yellow-600';
      case 'İptal Edildi': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // Mevcut tüm durumları al
  const allStatuses = [...new Set(orders.map(order => order.status))];
  const allPaymentStatuses = [...new Set(orders.map(order => order.paymentStatus))];

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push('...');
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  // Excel'e aktarma fonksiyonu
  const exportToExcel = () => {
    // Başlıklar
    const headers = [
      'Sipariş No',
      'Müşteri',
      'Sipariş Tarihi',
      'Teslim Tarihi',
      'Miktar',
      'Tutar',
      'Durum',
      'Ödeme Durumu',
      'Adres'
    ];

    // Verileri düzenle
    const data = filteredOrders.map(order => [
      order.orderNumber,
      order.customerName,
      order.orderDate,
      order.deliveryDate,
      `${order.quantity} Adet`,
      `₺${order.totalAmount}`,
      order.status,
      order.paymentStatus,
      order.shippingAddress
    ]);

    // CSV formatına dönüştür
    const csvContent = [
      headers.join(','),
      ...data.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Dosyayı indir
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `siparisler_${new Date().toLocaleDateString('tr-TR')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  // Menü öğeleri - Ayarlar hariç
  const menuItems: MenuItem[] = [
    {
      title: "Ana Sayfa",
      icon: <HomeIcon className="h-5 w-5" />,
      path: "/",
    },
    {
      title: "Satışlar",
      icon: <TrendingUp className="h-5 w-5" />,
      submenu: [
        { title: "Siparişler", path: "/sales/orders" },
        { title: "Teklifler", path: "/sales/quotes" },
        { title: "Müşteriler", path: "/sales/customers" },
        { title: "Faturalar", path: "/sales/invoices" },
      ],
    },
    {
      title: "Stok Yönetimi",
      icon: <Boxes className="h-5 w-5" />,
      submenu: [
        { title: "Ürünler", path: "/inventory/products" },
        { title: "Kategoriler", path: "/inventory/categories" },
        { title: "Stok Hareketleri", path: "/inventory/movements" },
        { title: "Depolar", path: "/inventory/warehouses" },
      ],
    },
    {
      title: "Satın Alma",
      icon: <ShoppingCart className="h-5 w-5" />,
      submenu: [
        { title: "Satın Alma Siparişleri", path: "/purchasing/orders" },
        { title: "Tedarikçiler", path: "/purchasing/suppliers" },
        { title: "Gider Yönetimi", path: "/purchasing/expenses" },
      ],
    },
    {
      title: "Lojistik",
      icon: <Truck className="h-5 w-5" />,
      submenu: [
        { title: "Sevkiyatlar", path: "/logistics/shipments" },
        { title: "Teslimatlar", path: "/logistics/deliveries" },
        { title: "Araç Takibi", path: "/logistics/vehicles" },
      ],
    },
    {
      title: "Finans",
      icon: <DollarSign className="h-5 w-5" />,
      submenu: [
        { title: "Ödemeler", path: "/finance/payments" },
        { title: "Tahsilatlar", path: "/finance/collections" },
        { title: "Banka İşlemleri", path: "/finance/banking" },
        { title: "Kasa", path: "/finance/cash" },
      ],
    },
    {
      title: "Raporlar",
      icon: <FileText className="h-5 w-5" />,
      submenu: [
        { title: "Satış Raporları", path: "/reports/sales" },
        { title: "Stok Raporları", path: "/reports/inventory" },
        { title: "Finans Raporları", path: "/reports/finance" },
        { title: "Performans Raporları", path: "/reports/performance" },
      ],
    },

  ];

  const router = useRouter();
   const handleLogout = () => {
    deleteCookie('token'); // Cookie'dan token sil
    localStorage.removeItem('token'); // Varsa localStorage'dan da sil
    router.push("/login")  // Login sayfasına yönlendir
  }


  // Menü öğelerini filtreleme fonksiyonu - Ayrı bir useMemo hook'u olarak tanımlandı
  const filteredMenuItems = useMemo(() => {
    if (!menuSearchTerm.trim()) return menuItems;

    return menuItems.filter(item => {
      const matchInMain = item.title.toLowerCase().includes(menuSearchTerm.toLowerCase());
      const matchInSubmenu = item.submenu?.some(subItem => 
        subItem.title.toLowerCase().includes(menuSearchTerm.toLowerCase())
      );
      return matchInMain || matchInSubmenu;
    });
  }, [menuSearchTerm]); // Sadece menuSearchTerm'e bağımlı

  // Toggle submenu
  const toggleSubmenu = (title: string) => {
    if (openSubmenu === title) {
      setOpenSubmenu(null);
    } else {
      setOpenSubmenu(title);
    }
  };

  // Bildirimler için örnek veri
  const notifications = {
    unread: 5,
    categories: {
      orders: [
        { id: 1, title: 'Yeni sipariş #1234', description: 'Müşteri: Ahmet Yılmaz - ₺1.234,56', time: '5 dakika önce', type: 'new' },
        { id: 2, title: 'Sipariş güncellendi #998', description: 'Durum: Hazırlanıyor → Kargoda', time: '15 dakika önce', type: 'update' },
      ],
      inventory: [
        { id: 3, title: 'Stok uyarısı', description: 'Ürün A - Kritik seviye (5 adet)', time: '1 saat önce', type: 'warning' },
        { id: 4, title: 'Stok girişi', description: 'Ürün B - 100 adet eklendi', time: '2 saat önce', type: 'success' },
      ],
      payments: [
        { id: 5, title: 'Ödeme bekleyen', description: '3 fatura için son ödeme tarihi yaklaşıyor', time: '3 saat önce', type: 'warning' },
      ],
    }

  };



  return (
    <div className={`flex min-h-screen ${isDarkTheme ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full border-r transition-all duration-300 z-50 
        ${isDarkTheme ? 'bg-black border-zinc-800' : 'bg-white border-gray-200'}
        ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        {/* Sidebar Header */}
        <div className={`flex items-center justify-between h-16 px-4 border-b 
          ${isDarkTheme ? 'border-zinc-800' : 'border-gray-200'}`}>
          {isSidebarOpen && <h1 className="text-xl font-bold">BMS XS</h1>}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2 rounded-lg cursor-pointer
              ${isDarkTheme ? 'hover:bg-zinc-900' : 'hover:bg-gray-100'}`}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Sidebar Menu */}
        <nav className="flex flex-col h-[calc(100%-4rem)]">
          {/* Search Input */}
          {isSidebarOpen && (
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Menüde ara..."
                  value={menuSearchTerm}
                  onChange={(e) => setMenuSearchTerm(e.target.value)}
                  className={`pl-9 pr-8 cursor-text w-full
                    ${isDarkTheme ? 'bg-zinc-900 border-zinc-800 text-white placeholder:text-gray-500' : 'bg-white'}
                  `}
                />
                {menuSearchTerm && (
                  <button
                    onClick={() => setMenuSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {filteredMenuItems.map((item) => (
                <li key={item.title}>
                  <button
                    onClick={() => item.submenu && toggleSubmenu(item.title)}
                    className={`flex items-center w-full p-2 rounded-lg cursor-pointer
                      ${isDarkTheme ? 'hover:bg-zinc-900' : 'hover:bg-gray-100'}
                      ${!isSidebarOpen ? 'justify-center' : 'justify-between'}
                      ${menuSearchTerm && 
                        (item.title.toLowerCase().includes(menuSearchTerm.toLowerCase()) || 
                        item.submenu?.some(subItem => subItem.title.toLowerCase().includes(menuSearchTerm.toLowerCase()))) 
                        ? isDarkTheme ? 'bg-zinc-900' : 'bg-gray-100' 
                        : ''
                      }`}
                  >
                    <div className="flex items-center">
                      {item.icon}
                      {isSidebarOpen && (
                        <span className="ml-3">{item.title}</span>
                      )}
                    </div>
                    {isSidebarOpen && item.submenu && (
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          openSubmenu === item.title ? 'transform rotate-180' : ''
                        }`}
                      />
                    )}
                  </button>
                  {/* Submenu */}
                  {isSidebarOpen && item.submenu && (menuSearchTerm || openSubmenu === item.title) && (
                    <ul className="mt-2 ml-6 space-y-2">
                      {item.submenu
                        .filter(subItem => 
                          !menuSearchTerm || 
                          subItem.title.toLowerCase().includes(menuSearchTerm.toLowerCase())
                        )
                        .map((subItem) => (
                          <li key={subItem.title}>
                            <button 
                              className={`flex items-center w-full p-2 rounded-lg cursor-pointer text-sm
                                ${isDarkTheme ? 'hover:bg-zinc-900' : 'hover:bg-gray-100'}
                                ${menuSearchTerm && subItem.title.toLowerCase().includes(menuSearchTerm.toLowerCase())
                                  ? isDarkTheme ? 'bg-zinc-900' : 'bg-gray-100'
                                  : ''
                                }`}
                            >
                              {subItem.title}
                            </button>
                          </li>
                        ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Bottom Section */}
          <div className={`p-4 border-t ${isDarkTheme ? 'border-zinc-800' : 'border-gray-200'} space-y-2`}>
            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkTheme(!isDarkTheme)}
              className={`flex items-center w-full p-2 rounded-lg cursor-pointer
                ${isDarkTheme ? 'hover:bg-zinc-900' : 'hover:bg-gray-100'}`}
            >
              <div className="flex items-center">
                {isDarkTheme ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                {isSidebarOpen && (
                  <span className="ml-3">{isDarkTheme ? 'Koyu Tema' : 'Açık Tema'}</span>
                )}
              </div>
            </button>

            {/* Settings */}
            <button
              className={`flex items-center w-full p-2 rounded-lg cursor-pointer
                ${isDarkTheme ? 'hover:bg-zinc-900' : 'hover:bg-gray-100'}`}
            >
              <div className="flex items-center">
                <Settings className="h-5 w-5" />
                {isSidebarOpen && (
                  <span className="ml-3">Ayarlar</span>
                )}
              </div>
            </button>
            
            {/*Çıkış yap*/}

         <button
              onClick={ handleLogout}
              className={`flex items-center w-full  text-red-500 font-medium p-2 rounded-lg cursor-pointer
                ${isDarkTheme ? 'hover:bg-zinc-900' : 'hover:bg-gray-100'}`}
            >
              <div className="flex items-center">
                <LogOut className="h-5 w-5" />
                {isSidebarOpen && (
                  <span className="ml-3 ">Çıkış Yap</span>
                )}
              </div>
            </button>
            

          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="p-8 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">BMS XS Dashboard</h1>
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="relative cursor-pointer">
                    <Bell className="h-5 w-5" />
                    {notifications.unread > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {notifications.unread}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className={`w-80 p-0 ${isDarkTheme ? 'bg-black border-zinc-800' : ''}`}
                >
                  <div className={`px-4 py-3 border-b ${isDarkTheme ? 'border-zinc-800' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Bildirimler</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${isDarkTheme ? 'bg-zinc-800' : 'bg-gray-100'}`}>
                        {notifications.unread} yeni
                      </span>
                    </div>
                  </div>
                  
                  {/* Siparişler */}
                  {notifications.categories.orders.length > 0 && (
                    <div className={`border-b ${isDarkTheme ? 'border-zinc-800' : 'border-gray-200'}`}>
                      <div className={`px-4 py-2 text-xs font-semibold ${isDarkTheme ? 'bg-zinc-900' : 'bg-gray-50'}`}>
                        Siparişler
                      </div>
                      {notifications.categories.orders.map(notification => (
                        <DropdownMenuItem key={notification.id} className="px-4 py-3 cursor-pointer focus:bg-gray-100">
                          <div className="flex items-start space-x-3">
                            <div className={`mt-0.5 p-1 rounded-full 
                              ${notification.type === 'new' 
                                ? isDarkTheme ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-600'
                                : isDarkTheme ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-600'
                              }`}
                            >
                              {notification.type === 'new' ? (
                                <ShoppingCart className="h-3 w-3" />
                              ) : (
                                <AlertCircle className="h-3 w-3" />
                              )}
                            </div>
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-medium">{notification.title}</p>
                              <p className={`text-xs ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
                                {notification.description}
                              </p>
                              <p className={`text-xs ${isDarkTheme ? 'text-gray-500' : 'text-gray-400'}`}>
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  )}

                  {/* Stok */}
                  {notifications.categories.inventory.length > 0 && (
                    <div className={`border-b ${isDarkTheme ? 'border-zinc-800' : 'border-gray-200'}`}>
                      <div className={`px-4 py-2 text-xs font-semibold ${isDarkTheme ? 'bg-zinc-900' : 'bg-gray-50'}`}>
                        Stok Yönetimi
                      </div>
                      {notifications.categories.inventory.map(notification => (
                        <DropdownMenuItem key={notification.id} className="px-4 py-3 cursor-pointer focus:bg-gray-100">
                          <div className="flex items-start space-x-3">
                            <div className={`mt-0.5 p-1 rounded-full 
                              ${notification.type === 'warning'
                                ? isDarkTheme ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-600'
                                : isDarkTheme ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-600'
                              }`}
                            >
                              <Package className="h-3 w-3" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-medium">{notification.title}</p>
                              <p className={`text-xs ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
                                {notification.description}
                              </p>
                              <p className={`text-xs ${isDarkTheme ? 'text-gray-500' : 'text-gray-400'}`}>
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  )}

                  {/* Ödemeler */}
                  {notifications.categories.payments.length > 0 && (
                    <div className={`border-b ${isDarkTheme ? 'border-zinc-800' : 'border-gray-200'}`}>
                      <div className={`px-4 py-2 text-xs font-semibold ${isDarkTheme ? 'bg-zinc-900' : 'bg-gray-50'}`}>
                        Ödemeler
                      </div>
                      {notifications.categories.payments.map(notification => (
                        <DropdownMenuItem key={notification.id} className="px-4 py-3 cursor-pointer focus:bg-gray-100">
                          <div className="flex items-start space-x-3">
                            <div className={`mt-0.5 p-1 rounded-full 
                              ${isDarkTheme ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-600'}`}
                            >
                              <DollarSign className="h-3 w-3" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-medium">{notification.title}</p>
                              <p className={`text-xs ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
                                {notification.description}
                              </p>
                              <p className={`text-xs ${isDarkTheme ? 'text-gray-500' : 'text-gray-400'}`}>
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  )}

                  {/* Tümünü Gör Butonu */}
                  <div className="p-2">
                    <Button 
                      variant="outline" 
                      className={`w-full cursor-pointer justify-center ${isDarkTheme ? 'border-zinc-800 hover:bg-zinc-900' : ''}`}
                    >
                      Tüm Bildirimleri Gör
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              <Avatar className="cursor-pointer">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className={`cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 
              ${isDarkTheme ? 'bg-black border-zinc-800' : ''}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className={`text-sm font-medium ${isDarkTheme ? 'text-white' : ''}`}>Toplam Gelir</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(45231.89)}
                </div>
                <p className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-muted-foreground'}`}>+20.1% geçen aydan</p>
              </CardContent>
            </Card>
            <Card className={`cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1
              ${isDarkTheme ? 'bg-black border-zinc-800' : ''}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className={`text-sm font-medium ${isDarkTheme ? 'text-white' : ''}`}>Yeni Siparişler</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+124</div>
                <p className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-muted-foreground'}`}>12 bekleyen sipariş</p>
              </CardContent>
            </Card>
            <Card className={`cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1
              ${isDarkTheme ? 'bg-black border-zinc-800' : ''}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className={`text-sm font-medium ${isDarkTheme ? 'text-white' : ''}`}>Aktif Müşteriler</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,345</div>
                <p className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-muted-foreground'}`}>+180 bu ay</p>
              </CardContent>
            </Card>
            <Card className={`cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1
              ${isDarkTheme ? 'bg-black border-zinc-800' : ''}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className={`text-sm font-medium ${isDarkTheme ? 'text-white' : ''}`}>Stok Durumu</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12,456</div>
                <p className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-muted-foreground'}`}>8 ürün kritik seviyede</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Recent Orders */}
            <Card className={`md:col-span-2 ${isDarkTheme ? 'bg-black border-zinc-800' : ''}`}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Son Siparişler</CardTitle>
                <Button
                  variant="outline"
                  onClick={exportToExcel}
                  className={`cursor-pointer ${isDarkTheme ? 'border-zinc-800 hover:bg-zinc-900 hover:text-black' : ''}`}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Excel'e Aktar
                </Button>
              </CardHeader>
              <CardContent>
                {/* Search and Filter Bar */}
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                  <div className="relative w-[300px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Sipariş no, müşteri adı veya adres ara..."
                      value={orderSearchTerm}
                      onChange={(e) => {
                        setOrderSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className={`pl-9 cursor-text ${isDarkTheme ? 'bg-zinc-900 border-zinc-800 text-white placeholder:text-gray-500' : ''}`}
                    />
                    {orderSearchTerm && (
                      <button
                        onClick={() => setOrderSearchTerm("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer "
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className={`cursor-pointer ${isDarkTheme ? 'border-zinc-800 hover:bg-zinc-900 text-white hover:text-black' : ''}`}>
                          <Filter className="h-4 w-4" />
                          Sipariş Durumu
                          {selectedStatuses.length > 0 && (
                            <span className={`ml-1 px-2 py-0.5 bg-primary text-black rounded-full text-xs`}>
                              {selectedStatuses.length}
                            </span>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        align="end" 
                        className={`w-48 ${isDarkTheme ? 'bg-black border-zinc-800 text-white' : ''}`}
                      >
                        {allStatuses.map((status) => (
                          <DropdownMenuCheckboxItem
                            key={status}
                            checked={selectedStatuses.includes(status)}
                            onCheckedChange={(checked) => {
                              setSelectedStatuses(prev =>
                                checked
                                  ? [...prev, status]
                                  : prev.filter(s => s !== status)
                              );
                              setCurrentPage(1);
                            }}
                            className={`cursor-pointer ${isDarkTheme ? 'hover:bg-zinc-900 focus:bg-zinc-900' : ''}`}
                          >
                            <span className={`px-2 py-1 rounded-full text-xs font-medium 
                              ${isDarkTheme 
                                ? status === 'Tamamlandı' ? 'bg-green-900 text-green-300'
                                : status === 'Hazırlanıyor' ? 'bg-yellow-900 text-yellow-300'
                                : status === 'İptal Edildi' ? 'bg-red-900 text-red-300'
                                : status === 'Kargoda' ? 'bg-blue-900 text-blue-300'
                                : 'bg-gray-900 text-gray-300'
                                : getStatusColor(status)}`}
                            >
                              {status}
                            </span>
                          </DropdownMenuCheckboxItem>
                        ))}
                        {selectedStatuses.length > 0 && (
                          <>
                            <DropdownMenuSeparator className={isDarkTheme ? 'bg-zinc-800' : ''} />
                            <DropdownMenuItem 
                              className={`justify-center cursor-pointer
                                ${isDarkTheme ? 'text-red-400 hover:bg-zinc-900 focus:bg-zinc-900 hover:text-black' : 'text-red-600'}`}
                              onClick={() => setSelectedStatuses([])}
                            >
                              Filtreleri Temizle
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className={`cursor-pointer ${isDarkTheme ? 'border-zinc-800 hover:bg-zinc-900 text-white hover:text-black' : ''}`}>
                          <Filter className="h-4 w-4" />
                          Ödeme Durumu
                          {selectedPaymentStatuses.length > 0 && (
                            <span className={`ml-1 px-2 py-0.5 bg-primary text-black rounded-full text-xs`}>
                              {selectedPaymentStatuses.length}
                            </span>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className={`w-48 ${isDarkTheme ? 'bg-black border-zinc-800 text-white' : ''}`}>
                        {allPaymentStatuses.map((status) => (
                          <DropdownMenuCheckboxItem
                            key={status}
                            checked={selectedPaymentStatuses.includes(status)}
                            onCheckedChange={(checked) => {
                              setSelectedPaymentStatuses(prev =>
                                checked
                                  ? [...prev, status]
                                  : prev.filter(s => s !== status)
                              );
                              setCurrentPage(1);
                            }}
                            className="cursor-pointer"
                          >
                            <span className={`font-medium ${getPaymentStatusColor(status)}`}>
                              {status}
                            </span>
                          </DropdownMenuCheckboxItem>
                        ))}
                        {selectedPaymentStatuses.length > 0 && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className={`justify-center cursor-pointer
                                ${isDarkTheme ? 'text-red-400 hover:bg-zinc-900 focus:bg-zinc-900 hover:text-black' : 'text-red-600'}`}
                              onClick={() => setSelectedPaymentStatuses([])}
                            >
                              Filtreleri Temizle
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Filtered Results Summary */}
                {(orderSearchTerm || selectedStatuses.length > 0 || selectedPaymentStatuses.length > 0) && (
                  <div className={`mb-4 text-sm ${isDarkTheme ? 'text-gray-300' : 'text-muted-foreground'}`}>
                    Toplam {filteredOrders.length} sonuç bulundu
                    {orderSearchTerm && ` "${orderSearchTerm}" için`}
                  </div>
                )}

                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className={`text-xs uppercase ${isDarkTheme ? 'bg-zinc-900 text-white' : 'bg-gray-50'}`}>
                      <tr>
                        <th 
                          className={`px-4 py-3 ${isDarkTheme ? 'border-zinc-800' : ''} group cursor-pointer`} 
                          style={{ width: '120px' }}
                          onClick={() => handleSort('orderNumber')}
                        >
                          <div className="flex items-center">
                            Sipariş No
                            <SortIcon column="orderNumber" />
                          </div>
                        </th>
                        <th className={`px-4 py-3 ${isDarkTheme ? 'border-zinc-800' : ''}`} style={{ width: '150px' }}>
                          Müşteri
                        </th>
                        <th 
                          className={`px-4 py-3 ${isDarkTheme ? 'border-zinc-800' : ''} group cursor-pointer`} 
                          style={{ width: '120px' }}
                          onClick={() => handleSort('orderDate')}
                        >
                          <div className="flex items-center">
                            Sipariş Tarihi
                            <SortIcon column="orderDate" />
                          </div>
                        </th>
                        <th 
                          className={`px-4 py-3 ${isDarkTheme ? 'border-zinc-800' : ''} group cursor-pointer`} 
                          style={{ width: '120px' }}
                          onClick={() => handleSort('deliveryDate')}
                        >
                          <div className="flex items-center">
                            Teslim Tarihi
                            <SortIcon column="deliveryDate" />
                          </div>
                        </th>
                        <th 
                          className={`px-4 py-3 ${isDarkTheme ? 'border-zinc-800' : ''} group cursor-pointer`} 
                          style={{ width: '100px' }}
                          onClick={() => handleSort('quantity')}
                        >
                          <div className="flex items-center">
                            Miktar
                            <SortIcon column="quantity" />
                          </div>
                        </th>
                        <th 
                          className={`px-4 py-3 ${isDarkTheme ? 'border-zinc-800' : ''} group cursor-pointer`} 
                          style={{ width: '120px' }}
                          onClick={() => handleSort('totalAmount')}
                        >
                          <div className="flex items-center">
                            Tutar
                            <SortIcon column="totalAmount" />
                          </div>
                        </th>
                        <th className={`px-4 py-3 ${isDarkTheme ? 'border-zinc-800' : ''}`} style={{ width: '120px' }}>
                          Durum
                        </th>
                        <th className={`px-4 py-3 ${isDarkTheme ? 'border-zinc-800' : ''}`} style={{ width: '120px' }}>
                          Ödeme
                        </th>
                        <th className={`px-4 py-3 ${isDarkTheme ? 'border-zinc-800' : ''}`} style={{ width: '200px' }}>
                          Adres
                        </th>
                        <th className={`px-4 py-3 ${isDarkTheme ? 'border-zinc-800' : ''}`} style={{ width: '100px' }}>
                          İşlem
                        </th>
                      </tr>
                    </thead>
                    <tbody className={isDarkTheme ? 'text-white' : ''}>
                      {getCurrentPageOrders().map((order) => (
                        <tr key={order.id} 
                          className={`border-b cursor-pointer hover:bg-opacity-50
                            ${isDarkTheme 
                              ? 'border-zinc-800 hover:bg-zinc-800' 
                              : 'hover:bg-gray-100'}`}
                          onClick={() => {
                            const orderNumberOnly = order.orderNumber.replace('#', '');
                            window.open(`/OrderDetail/${orderNumberOnly}`, '_blank');
                          }}
                        >
                          <td className="px-4 py-3" style={{ width: '120px' }}>{order.orderNumber}</td>
                          <td className="px-4 py-3" style={{ width: '150px' }}>{order.customerName}</td>
                          <td className="px-4 py-3" style={{ width: '120px' }}>{order.orderDate}</td>
                          <td className="px-4 py-3" style={{ width: '120px' }}>{order.deliveryDate}</td>
                          <td className="px-4 py-3" style={{ width: '100px' }}>{order.quantity} Adet</td>
                          <td className="px-4 py-3" style={{ width: '120px' }}>
                            {formatTableCurrency(parseFloat(order.totalAmount))}
                          </td>
                          <td className="px-4 py-3" style={{ width: '120px' }}>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium 
                              ${isDarkTheme 
                                ? order.status === 'Tamamlandı' ? 'bg-green-900 text-green-300'
                                : order.status === 'Hazırlanıyor' ? 'bg-yellow-900 text-yellow-300'
                                : order.status === 'İptal Edildi' ? 'bg-red-900 text-red-300'
                                : order.status === 'Kargoda' ? 'bg-blue-900 text-blue-300'
                                : 'bg-gray-900 text-gray-300'
                                : getStatusColor(order.status)}`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3" style={{ width: '120px' }}>
                            <span className={`font-medium 
                              ${isDarkTheme
                                ? order.paymentStatus === 'Ödendi' ? 'text-green-400'
                                : order.paymentStatus === 'Beklemede' ? 'text-yellow-400'
                                : order.paymentStatus === 'İptal Edildi' ? 'text-red-400'
                                : 'text-gray-400'
                                : getPaymentStatusColor(order.paymentStatus)}`}
                            >
                              {order.paymentStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3" style={{ width: '200px' }}>{order.shippingAddress}</td>
                          <td className="px-4 py-3 text-right">
                            <div className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium transition-all duration-200
                              ${isDarkTheme 
                                ? 'bg-zinc-800 text-white hover:bg-zinc-700' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Detay
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {/* Pagination - Enhanced version */}
                  <div className="flex flex-col items-center space-y-4 mt-6 pb-2">
                    <div className="flex items-center justify-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className={`h-8 w-8 p-0 cursor-pointer
                          ${isDarkTheme ? 'border-zinc-800 hover:bg-zinc-900 disabled:bg-zinc-900 text-white hover:text-black' : ''}`}
                      >
                        <ChevronLeft className="h-4 w-4 mr-[-4px]" />
                        <ChevronLeft className="h-4 w-4 ml-[-4px]" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className={`h-8 w-8 p-0 cursor-pointer ${isDarkTheme ? 'text-white border-zinc-800 hover:bg-zinc-900 hover:text-black' : ''}`}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      <div className="flex items-center space-x-1">
                        {generatePageNumbers().map((page, index) => (
                          page === '...' ? (
                            <span key={`ellipsis-${index}`} className="px-2">
                              ...
                            </span>
                          ) : (
                            <button
                              key={page}
                              onClick={() => typeof page === 'number' && setCurrentPage(page)}
                              className={`h-8 w-8 flex items-center justify-center rounded-md cursor-pointer
                                ${currentPage === page 
                                  ? isDarkTheme 
                                    ? 'bg-primary text-white' 
                                    : 'bg-primary text-white'
                                  : isDarkTheme ? 'text-white hover:bg-zinc-900 hover:text-black' : ''}`}
                            >
                              {page}
                            </button>
                          )
                        ))}
                      </div>

                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className={`h-8 w-8 p-0 cursor-pointer ${isDarkTheme ? 'text-white border-zinc-800 hover:bg-zinc-900 hover:text-black' : ''}`}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className={`h-8 w-8 p-0 cursor-pointer ${isDarkTheme ? 'text-white border-zinc-800 hover:bg-zinc-900 hover:text-black' : ''}`}
                      >
                        <ChevronRight className="h-4 w-4 ml-[-4px]" />
                        <ChevronRight className="h-4 w-4 mr-[-4px]" />
                      </Button>
                    </div>
                    <div className={`text-sm ${isDarkTheme ? 'text-gray-300' : 'text-muted-foreground'}`}>
                      Toplam {filteredOrders.length} sipariş • Sayfa {currentPage} / {totalPages}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alerts & Tasks Card */}
            <Card className={isDarkTheme ? 'bg-black border-zinc-800' : ''}>
              <CardHeader>
                <CardTitle>Uyarılar & Görevler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className={`flex items-center space-x-4 p-2 rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02]
                    ${isDarkTheme ? 'bg-red-900/20 hover:bg-red-900/30' : 'bg-red-50 hover:bg-red-100'}`}
                  >
                    <AlertCircle className={isDarkTheme ? 'h-5 w-5 text-red-400' : 'h-5 w-5 text-red-500'} />
                    <div>
                      <p className="font-medium">Kritik Stok Uyarısı</p>
                      <p className={isDarkTheme ? 'text-sm text-gray-300' : 'text-sm text-muted-foreground'}>
                        Ürün A stok seviyesi kritik
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center space-x-4 p-2 border rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02]
                    ${isDarkTheme ? 'border-zinc-800 hover:bg-zinc-900' : 'hover:bg-gray-50'}`}
                  >
                    <div className={`w-2 h-2 rounded-full ${isDarkTheme ? 'bg-yellow-400' : 'bg-yellow-400'}`} />
                    <div>
                      <p className="font-medium">Fatura Ödemesi</p>
                      <p className={isDarkTheme ? 'text-sm text-gray-300' : 'text-sm text-muted-foreground'}>
                        3 bekleyen fatura
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center space-x-4 p-2 border rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02]
                    ${isDarkTheme ? 'border-zinc-800 hover:bg-zinc-900' : 'hover:bg-gray-50'}`}
                  >
                    <div className={`w-2 h-2 rounded-full ${isDarkTheme ? 'bg-green-400' : 'bg-green-400'}`} />
                    <div>
                      <p className="font-medium">Teslimat Planlaması</p>
                      <p className={isDarkTheme ? 'text-sm text-gray-300' : 'text-sm text-muted-foreground'}>
                        5 teslimat planlanacak
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
} 