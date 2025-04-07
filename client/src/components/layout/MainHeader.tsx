// This component has been replaced by Header.tsx

export default function MainHeader() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/data-catalog", label: "Data Catalog" },
    { path: "/upload-dataset", label: "Upload Dataset", requiresAuth: true, allowedRoles: ["admin", "uploader"] },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Only show navbar items based on user's role
  const filteredNavItems = navItems.filter(item => {
    if (!item.requiresAuth) return true;
    if (!user) return false;
    if (!item.allowedRoles) return true;
    return item.allowedRoles.includes(user.role || "user");
  });

  return (
    <header className="bg-white border-b sticky top-0 z-40">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo and Title */}
        <div className="flex items-center">
          <Link href="/">
            <a className="flex items-center space-x-2">
              <Database className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">HDX</span>
            </a>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {filteredNavItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <a
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  location === item.path
                    ? "text-primary font-semibold"
                    : "text-muted-foreground"
                )}
              >
                {item.label}
              </a>
            </Link>
          ))}
        </nav>

        {/* Auth Buttons or User Menu */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 rounded-full">
                  <div className="flex items-center space-x-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                      <span className="text-xs font-medium text-primary-foreground">
                        {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium">
                      {user.displayName || user.username}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.role && (
                  <DropdownMenuItem disabled>
                    Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </DropdownMenuItem>
                )}
                {user.organization && (
                  <DropdownMenuItem disabled>
                    Org: {user.organization}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {user.role === "admin" || user.role === "uploader" ? (
                  <DropdownMenuItem asChild>
                    <Link href="/upload-dataset">
                      <a className="flex w-full items-center">
                        <Upload className="mr-2 h-4 w-4" />
                        <span>Upload Dataset</span>
                      </a>
                    </Link>
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem onClick={() => logoutMutation.mutate()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth">
              <Button variant="default">Login / Register</Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button variant="ghost" size="sm" onClick={toggleMobileMenu}>
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden p-4 border-t bg-background">
          <nav className="flex flex-col space-y-4">
            {filteredNavItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <a
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    location === item.path
                      ? "text-primary font-semibold"
                      : "text-muted-foreground"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              </Link>
            ))}
            {!user ? (
              <Link href="/auth">
                <a
                  className="text-sm font-medium text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login / Register
                </a>
              </Link>
            ) : (
              <button
                onClick={() => {
                  logoutMutation.mutate();
                  setMobileMenuOpen(false);
                }}
                className="text-sm font-medium text-destructive text-left"
              >
                Logout
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}