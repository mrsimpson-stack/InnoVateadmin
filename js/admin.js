// Admin Panel Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check admin authentication
    const admin = JSON.parse(localStorage.getItem('admin'));
    if (!admin && !window.location.pathname.includes('admin/index.html')) {
        window.location.href = 'index.html';
        return;
    }
    
    // Load admin data
    if (window.location.pathname.includes('dashboard.html')) {
        loadDashboardData();
    }
    
    if (window.location.pathname.includes('users.html')) {
        loadUsersData();
    }
    
    if (window.location.pathname.includes('withdrawals.html')) {
        loadWithdrawalsData();
    }
});

function loadDashboardData() {
    // Load stats
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const transactions = getAllTransactions(users);
    
    document.getElementById('total-users-count').textContent = users.length;
    document.getElementById('active-users-count').textContent = users.filter(u => u.balance > 0).length;
    
    const pendingWithdrawals = transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending').length;
    document.getElementById('pending-withdrawals-count').textContent = pendingWithdrawals;
    
    const totalDeposits = transactions
        .filter(t => t.type === 'deposit')
        .reduce((sum, t) => sum + t.amount, 0);
    document.getElementById('total-deposits-amount').textContent = formatCurrency(totalDeposits);
    
    // Load recent activity
    const recentActivity = transactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
    
    const activityList = document.getElementById('recent-activity');
    activityList.innerHTML = '';
    
    recentActivity.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        
        let icon = '';
        let description = '';
        
        if (activity.type === 'deposit') {
            icon = '💰';
            description = `<strong>${getUserEmail(activity.userId)}</strong> deposited ${formatCurrency(activity.amount)}`;
        } else if (activity.type === 'withdrawal') {
            icon = '💸';
            description = `<strong>${getUserEmail(activity.userId)}</strong> requested withdrawal of ${formatCurrency(activity.amount)}`;
        } else if (activity.type === 'earning') {
            icon = '📈';
            description = `<strong>${getUserEmail(activity.userId)}</strong> earned ${formatCurrency(activity.amount)}`;
        }
        
        activityItem.innerHTML = `
            <div class="activity-icon">${icon}</div>
            <div class="activity-content">
                <p>${description}</p>
                <div class="activity-time">${formatDate(activity.date)}</div>
            </div>
        `;
        
        activityList.appendChild(activityItem);
    });
}

function loadUsersData() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const usersTable = document.getElementById('users-table').querySelector('tbody');
    usersTable.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${user.id.slice(-6)}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.phone || 'N/A'}</td>
            <td>${formatCurrency(user.balance || 0)}</td>
            <td>
                <span class="status-badge ${user.balance > 0 ? 'status-active' : 'status-inactive'}">
                    ${user.balance > 0 ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td>
                <button class="btn-action btn-view" data-user-id="${user.id}">View</button>
            </td>
        `;
        
        usersTable.appendChild(row);
    });
}

function loadWithdrawalsData() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const transactions = getAllTransactions(users);
    const withdrawals = transactions.filter(t => t.type === 'withdrawal');
    
    const withdrawalsTable = document.getElementById('withdrawals-table').querySelector('tbody');
    withdrawalsTable.innerHTML = '';
    
    withdrawals.forEach(withdrawal => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${withdrawal.id.slice(-6)}</td>
            <td>${getUserEmail(withdrawal.userId)}</td>
            <td>${formatCurrency(withdrawal.amount)}</td>
            <td>${withdrawal.method}</td>
            <td>${formatDate(withdrawal.date)}</td>
            <td>
                <span class="status-badge status-${withdrawal.status}">
                    ${withdrawal.status}
                </span>
            </td>
            <td>
                ${withdrawal.status === 'pending' ? `
                    <button class="btn-action btn-approve" data-withdrawal-id="${withdrawal.id}">Approve</button>
                    <button class="btn-action btn-reject" data-withdrawal-id="${withdrawal.id}">Reject</button>
                ` : '—'}
            </td>
        `;
        
        withdrawalsTable.appendChild(row);
    });
    
    // Add event listeners for approve/reject buttons
    document.querySelectorAll('.btn-approve').forEach(btn => {
        btn.addEventListener('click', function() {
            approveWithdrawal(this.dataset.withdrawalId);
        });
    });
    
    document.querySelectorAll('.btn-reject').forEach(btn => {
        btn.addEventListener('click', function() {
            rejectWithdrawal(this.dataset.withdrawalId);
        });
    });
}

function approveWithdrawal(withdrawalId) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    let withdrawalProcessed = false;
    
    // Find and update the withdrawal
    for (const user of users) {
        if (user.transactions) {
            const withdrawal = user.transactions.find(t => t.id === withdrawalId && t.type === 'withdrawal');
            if (withdrawal) {
                withdrawal.status = 'approved';
                withdrawalProcessed = true;
                break;
            }
        }
    }
    
    if (withdrawalProcessed) {
        localStorage.setItem('users', JSON.stringify(users));
        loadWithdrawalsData(); // Refresh the table
        alert('Withdrawal approved successfully');
    }
}

function rejectWithdrawal(withdrawalId) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    let withdrawalProcessed = false;
    
    // Find and update the withdrawal
    for (const user of users) {
        if (user.transactions) {
            const withdrawal = user.transactions.find(t => t.id === withdrawalId && t.type === 'withdrawal');
            if (withdrawal) {
                withdrawal.status = 'rejected';
                withdrawalProcessed = true;
                break;
            }
        }
    }
    
    if (withdrawalProcessed) {
        localStorage.setItem('users', JSON.stringify(users));
        loadWithdrawalsData(); // Refresh the table
        alert('Withdrawal rejected');
    }
}

// Helper functions
function getAllTransactions(users) {
    return users.flatMap(user => 
        (user.transactions || []).map(t => ({ ...t, userId: user.id }))
    );
}

function getUserEmail(userId) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.id === userId);
    return user ? user.email : 'Unknown';
}

function formatCurrency(amount) {
    return '$' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}