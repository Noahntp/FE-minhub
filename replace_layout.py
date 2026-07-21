import sys

def modify_dashboard():
    with open("src/components/AdminDashboard.tsx", "r", encoding="utf-8") as f:
        lines = f.readlines()

    # Find where the return starts
    start_idx = -1
    for i, line in enumerate(lines):
        if "return (" in line and "bg-white min-h-[85vh]" in lines[i+1]:
            start_idx = i
            break
            
    # Find where the main content starts
    main_content_start_idx = -1
    for i in range(start_idx, len(lines)):
        if "Main Administrative Container Body" in lines[i]:
            main_content_start_idx = i + 1
            break
            
    if start_idx == -1 or main_content_start_idx == -1:
        print("Could not find start indices")
        return

    # Replace the layout wrapper
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

"""
    # Now we need to remove the old 'orders_management' tab rendering
    # and the old 'payouts_requests' tab rendering.
    # We will just comment them out or skip them.
    # Wait, it's easier to just do a string replacement.
    
    # We replace from start_idx to main_content_start_idx with new_start
    lines_to_keep = lines[main_content_start_idx+1:]
    
    # Let's find the end of the return statement
    end_idx = -1
    for i in range(len(lines_to_keep)-1, -1, -1):
        if "  );" in lines_to_keep[i] and "}" in lines_to_keep[i+1] and "// Inline helper" in lines_to_keep[i+3]:
            end_idx = i
            break
            
    if end_idx == -1:
        # Fallback for end_idx
        for i in range(len(lines_to_keep)-1, -1, -1):
            if "// Inline helper" in lines_to_keep[i]:
                for j in range(i-1, -1, -1):
                    if "  );" in lines_to_keep[j]:
                        end_idx = j
                        break
                break

    lines_to_keep = lines_to_keep[:end_idx]
    
    # Now let's remove the old orders_management and payouts_requests
    content_str = "".join(lines_to_keep)
    
    # Find activeTab === 'orders_management'
    import re
    # We can just remove the sections if we know where they are, or just leave them but change their condition to something impossible.
    content_str = content_str.replace("activeTab === 'orders_management'", "activeTab === 'orders_management_OLD'")
    content_str = content_str.replace("activeTab === 'payouts_requests'", "activeTab === 'payouts_requests_OLD'")
    
    # Reassemble
    new_content = lines[:start_idx] + [new_start] + [content_str] + ["    </AdminLayout>\n  );\n}\n\n"] + lines[end_idx + len(lines[:start_idx]) + (len(lines) - len(lines_to_keep) - start_idx):]
    # Wait, the end calculation is tricky. Let's just append the rest of the file after the original end_idx.
    
    # Let's do it safely:
    rest_of_file = lines[main_content_start_idx+1 + end_idx + 2:] # skip the ");" and "}"
    
    final_lines = lines[:start_idx] + [new_start] + [content_str] + ["    </AdminLayout>\n  );\n}\n"] + rest_of_file
    
    # Add imports
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

modify_dashboard()
