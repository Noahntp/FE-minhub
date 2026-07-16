import sys

def modify():
    with open("src/components/AdminDashboard.tsx", "r", encoding="utf-8") as f:
        lines = f.readlines()

    start_idx = -1
    for i, line in enumerate(lines):
        if "return (" in line and "bg-white min-h-[85vh]" in lines[i+1]:
            start_idx = i
            break

    main_content_start_idx = -1
    for i in range(start_idx, len(lines)):
        if "Main Administrative Container Body" in lines[i]:
            main_content_start_idx = i + 1
            break

    end_idx = -1
    for i in range(len(lines)-1, -1, -1):
        if "  );" in lines[i] and "}" in lines[i+1] and "// Inline helper" in lines[i+3]:
            end_idx = i
            break

    new_start = """  return (
    <AdminLayout
      currentUser={currentUser}
      onLogout={onClose}
      activeTab={activeTab}
      onTabChange={(tab) => setActiveTab(tab as any)}
    >
      {activeTab === 'revenues' && <AdminRevenues orders={orders} />}
      {activeTab === 'withdrawals' && <AdminWithdrawals payoutRequests={payoutRequests} onApprovePayout={onApprovePayout} onRejectPayout={onRejectPayout} />}
      {activeTab === 'orders_management' && <AdminOrders orders={orders} />}
      
      {/* Fallback container for old tabs */}
      <div className="flex-1 space-y-6">
"""
    
    middle_lines = lines[main_content_start_idx+1:end_idx]
    
    # modify middle_lines
    middle_str = "".join(middle_lines)
    middle_str = middle_str.replace("activeTab === 'orders_management'", "activeTab === 'orders_management_old'")
    middle_str = middle_str.replace("activeTab === 'payouts_requests'", "activeTab === 'payouts_requests_old'")

    new_end = "    </AdminLayout>\n  );\n}\n"
    
    rest = lines[end_idx+2:]
    
    final_lines = lines[:start_idx] + [new_start] + [middle_str] + [new_end] + rest
    
    import_idx = -1
    for i, line in enumerate(final_lines):
        if "import { Course, User" in line:
            import_idx = i
            break
            
    if import_idx != -1:
        imports = (
            "import AdminLayout from './Admin/AdminLayout';\n"
            "import AdminOrders from './Admin/AdminOrders';\n"
            "import AdminWithdrawals from './Admin/AdminWithdrawals';\n"
            "import AdminRevenues from './Admin/AdminRevenues';\n"
        )
        final_lines.insert(import_idx + 1, imports)
        
    with open("src/components/AdminDashboard.tsx", "w", encoding="utf-8") as f:
        f.writelines(final_lines)

modify()
