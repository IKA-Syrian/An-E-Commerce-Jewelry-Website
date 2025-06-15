import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarTrigger,
  SidebarInset
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  FileText, 
  MessageSquare, 
  TrendingUp,
  Settings,
  LogOut,
  Plus,
  Tag
} from 'lucide-react';
import { useAdminContext } from '@/context/AdminContext';
import { verifyAdminAuth } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

const adminMenuItems = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Product Management",
    items: [
      { title: "View All Products", url: "/admin/products", icon: Package },
      { title: "Add New Product", url: "/admin/products/new", icon: Plus },
      { title: "Categories", url: "/admin/categories", icon: Tag },
    ]
  },
  {
    title: "Order Management",
    url: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Customer Management",
    url: "/admin/customers",
    icon: Users,
  },
  {
    title: "Content Management",
    items: [
      { title: "Site Pages", url: "/admin/site-content", icon: FileText },
      { title: "Social Media Links", url: "/admin/social-media-links", icon: Settings },
    ]
  },
  {
    title: "Inquiry Management",
    url: "/admin/inquiries",
    icon: MessageSquare,
  },
  {
    title: "Gold Price Log",
    url: "/admin/gold-prices",
    icon: TrendingUp,
  },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { admin, isAuthenticated, logout, loading, refreshAdminToken } = useAdminContext();
  const { toast } = useToast();

  // Refresh the admin token on page load/navigation
  useEffect(() => {
    // Only refresh if we have a token to begin with
    // This prevents infinite refreshes when not authenticated
    if (localStorage.getItem('adminJwt')) {
      refreshAdminToken();
      console.log("Admin token refreshed in layout");
    }
  }, [refreshAdminToken]); // Remove location.pathname dependency to prevent loops

  // Redirect to admin login if not authenticated
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Only log warning once per session, not on every render
    const hasToken = !!localStorage.getItem('adminJwt');
    const hasUserData = !!localStorage.getItem('adminUser');
    
    if (hasToken || hasUserData) {
      console.warn('Admin authentication failed - redirecting to login', { hasToken, hasUserData });
      
      // Clear any invalid tokens to prevent authentication loops
      localStorage.removeItem('adminJwt');
      localStorage.removeItem('adminUser');
      
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'Please log in to access the admin panel',
      });
    }
    
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    // Call the logout function from context
    logout();
    
    // Use navigate instead of Navigate component to avoid rendering issues
    navigate('/admin/login', { replace: true });
    
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out'
    });
  };

  const isActive = (url: string) => location.pathname === url;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar className="max-w-[85vw] md:max-w-[300px]">
          <SidebarHeader className="border-b p-4">
            <h2 className="text-lg font-semibold">Golden House - Admin</h2>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-muted-foreground">
                {admin?.first_name} {admin?.last_name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="h-8 w-8 p-0"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {adminMenuItems.map((item) => (
                    <React.Fragment key={item.title}>
                      {item.url ? (
                        <SidebarMenuItem>
                          <SidebarMenuButton 
                            asChild 
                            isActive={isActive(item.url)}
                          >
                            <Link to={item.url} className="flex items-center gap-3 py-2">
                              <item.icon className="h-5 w-5" />
                              <span className="flex-1 text-sm">{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ) : (
                        <>
                          <SidebarGroupLabel className="mt-4 mb-1 text-xs font-medium">
                            {item.title}
                          </SidebarGroupLabel>
                          {item.items?.map((subItem) => (
                            <SidebarMenuItem key={subItem.title}>
                              <SidebarMenuButton 
                                asChild 
                                isActive={isActive(subItem.url)}
                              >
                                <Link to={subItem.url} className="flex items-center gap-3 py-2 pl-3">
                                  <subItem.icon className="h-4 w-4" />
                                  <span className="flex-1 text-sm">{subItem.title}</span>
                                </Link>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))}
                        </>
                      )}
                    </React.Fragment>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="border-b bg-background p-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="text-foreground hover:bg-muted" />
              <h1 className="text-xl font-semibold">Admin Panel</h1>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
