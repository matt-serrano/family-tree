// Family Tree Application JavaScript

// Mock Database - In production, this would be replaced with API calls
const mockDatabase = {
    users: [
        { id: 1, email: 'demo@family.com', password: 'demo123', name: 'Demo User' }
    ],
    familyMembers: [
        {
            id: 1,
            userId: 1,
            fullName: 'John Smith',
            dateOfBirth: '1950-05-15',
            description: 'Loving father and grandfather. Worked as an engineer for 40 years and loved woodworking.',
            profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            photos: [
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
                'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop'
            ],
            parentId: null,
            spouseId: 2,
            generation: 0
        },
        {
            id: 2,
            userId: 1,
            fullName: 'Mary Smith',
            dateOfBirth: '1952-08-22',
            description: 'Devoted mother and teacher. Spent 35 years educating children and volunteering at the local library.',
            profilePhoto: 'https://images.unsplash.com/photo-1494790108755-2616c3584f15?w=150&h=150&fit=crop&crop=face',
            photos: [
                'https://images.unsplash.com/photo-1494790108755-2616c3584f15?w=200&h=200&fit=crop'
            ],
            parentId: null,
            spouseId: 1,
            generation: 0
        },
        {
            id: 3,
            userId: 1,
            fullName: 'David Smith',
            dateOfBirth: '1975-03-10',
            description: 'Software developer and father of two. Loves hiking and photography.',
            profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
            photos: [],
            parentId: 1,
            spouseId: null,
            generation: 1
        }
    ]
};

// Application State
let currentUser = null;
let familyMembers = [];

// DOM Elements
const views = {
    login: document.getElementById('loginView'),
    register: document.getElementById('registerView'),
    tree: document.getElementById('treeView'),
    add: document.getElementById('addView')
};

const nav = document.getElementById('mainNav');
const userName = document.getElementById('userName');

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    showView('login');
});

// Event Listeners
function initializeEventListeners() {
    // Authentication
    document.getElementById('loginBtn').addEventListener('click', handleLogin);
    document.getElementById('registerBtn').addEventListener('click', handleRegister);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // View Navigation
    document.getElementById('showRegister').addEventListener('click', () => showView('register'));
    document.getElementById('showLogin').addEventListener('click', () => showView('login'));
    
    // Navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const view = e.currentTarget.dataset.view;
            showView(view);
        });
    });
    
    // Other view change buttons
    document.querySelectorAll('[data-view]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const view = e.currentTarget.dataset.view;
            showView(view);
        });
    });
    
    // Add member form
    document.getElementById('addMemberBtn').addEventListener('click', handleAddMember);
    
    // Modal controls
    document.querySelector('.modal-close').addEventListener('click', closeModal);
    document.querySelector('.modal-backdrop').addEventListener('click', closeModal);
    
    // Prevent form submission on Enter key
    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const activeView = document.querySelector('.view.active');
            if (activeView.id === 'loginView') {
                handleLogin();
            } else if (activeView.id === 'registerView') {
                handleRegister();
            }
        }
    });
}

// Authentication Functions
function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    
    const user = mockDatabase.users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        userName.textContent = `Hello, ${user.name}`;
        loadFamilyMembers();
        showView('tree');
        nav.style.display = 'flex';
        errorDiv.style.display = 'none';
    } else {
        errorDiv.textContent = 'Invalid email or password';
        errorDiv.style.display = 'block';
    }
}

function handleRegister() {
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    if (!name || !email || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    // Check if user already exists
    const existingUser = mockDatabase.users.find(u => u.email === email);
    if (existingUser) {
        alert('User with this email already exists');
        return;
    }
    
    const newUser = {
        id: mockDatabase.users.length + 1,
        email,
        password,
        name
    };
    
    mockDatabase.users.push(newUser);
    currentUser = newUser;
    userName.textContent = `Hello, ${newUser.name}`;
    loadFamilyMembers();
    showView('tree');
    nav.style.display = 'flex';
}

function handleLogout() {
    currentUser = null;
    familyMembers = [];
    nav.style.display = 'none';
    showView('login');
    
    // Reset forms
    document.getElementById('loginEmail').value = 'demo@family.com';
    document.getElementById('loginPassword').value = 'demo123';
    document.getElementById('registerName').value = '';
    document.getElementById('registerEmail').value = '';
    document.getElementById('registerPassword').value = '';
}

// View Management
function showView(viewName) {
    // Hide all views
    Object.values(views).forEach(view => {
        view.classList.remove('active');
    });
    
    // Show selected view
    if (views[viewName]) {
        views[viewName].classList.add('active');
    }
    
    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeNavBtn = document.querySelector(`[data-view="${viewName}"]`);
    if (activeNavBtn && activeNavBtn.classList.contains('nav-btn')) {
        activeNavBtn.classList.add('active');
    }
}

// Family Members Management
function loadFamilyMembers() {
    if (!currentUser) return;
    
    familyMembers = mockDatabase.familyMembers.filter(
        member => member.userId === currentUser.id
    );
    
    renderFamilyTree();
}

function renderFamilyTree() {
    const container = document.getElementById('generationsContainer');
    const emptyState = document.getElementById('emptyState');
    
    if (familyMembers.length === 0) {
        emptyState.style.display = 'block';
        container.style.display = 'none';
        return;
    }
    
    emptyState.style.display = 'none';
    container.style.display = 'block';
    
    // Group members by generation
    const generations = {};
    familyMembers.forEach(member => {
        if (!generations[member.generation]) {
            generations[member.generation] = [];
        }
        generations[member.generation].push(member);
    });
    
    // Clear container
    container.innerHTML = '';
    
    // Render each generation
    Object.keys(generations).forEach(gen => {
        const generationDiv = document.createElement('div');
        generationDiv.className = 'generation';
        
        const headerDiv = document.createElement('div');
        headerDiv.className = 'generation-header';
        
        const title = document.createElement('h3');
        title.className = 'generation-title';
        title.textContent = `Generation ${parseInt(gen) + 1}`;
        headerDiv.appendChild(title);
        
        const membersDiv = document.createElement('div');
        membersDiv.className = 'generation-members';
        
        generations[gen].forEach(member => {
            const memberCard = createMemberCard(member);
            membersDiv.appendChild(memberCard);
        });
        
        generationDiv.appendChild(headerDiv);
        generationDiv.appendChild(membersDiv);
        container.appendChild(generationDiv);
    });
}

function createMemberCard(member) {
    const card = document.createElement('div');
    card.className = 'member-card';
    card.addEventListener('click', () => showMemberModal(member));
    
    const age = member.dateOfBirth ? 
        new Date().getFullYear() - new Date(member.dateOfBirth).getFullYear() : null;
    
    const photoUrl = member.profilePhoto || 
        `https://ui-avatars.com/api/?name=${encodeURIComponent(member.fullName)}&size=120&background=6366f1&color=fff`;
    
    card.innerHTML = `
        <div class="member-photo">
            <img src="${photoUrl}" alt="${member.fullName}">
        </div>
        <h3 class="member-name">${member.fullName}</h3>
        ${age ? `<p class="member-age">Age ${age}</p>` : ''}
        <p class="member-description">${member.description}</p>
    `;
    
    return card;
}

// Modal Functions
function showMemberModal(member) {
    const modal = document.getElementById('memberModal');
    const modalName = document.getElementById('modalName');
    const modalPhoto = document.getElementById('modalPhoto');
    const modalDob = document.getElementById('modalDob');
    const modalDescription = document.getElementById('modalDescription');
    const modalPhotos = document.getElementById('modalPhotos');
    const photoGrid = document.getElementById('photoGrid');
    
    const age = member.dateOfBirth ? 
        new Date().getFullYear() - new Date(member.dateOfBirth).getFullYear() : null;
    
    const photoUrl = member.profilePhoto || 
        `https://ui-avatars.com/api/?name=${encodeURIComponent(member.fullName)}&size=300&background=6366f1&color=fff`;
    
    // Update modal content
    modalName.textContent = member.fullName;
    modalPhoto.src = photoUrl;
    modalPhoto.alt = member.fullName;
    
    const dobDate = new Date(member.dateOfBirth);
    modalDob.textContent = dobDate.toLocaleDateString() + (age ? ` (Age ${age})` : '');
    modalDescription.textContent = member.description;
    
    // Handle photo gallery
    if (member.photos && member.photos.length > 0) {
        modalPhotos.style.display = 'block';
        photoGrid.innerHTML = '';
        
        member.photos.forEach(photo => {
            const img = document.createElement('img');
            img.src = photo;
            img.alt = `${member.fullName} - Photo`;
            photoGrid.appendChild(img);
        });
    } else {
        modalPhotos.style.display = 'none';
    }
    
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('memberModal').classList.remove('active');
}

// Add Member Functions
function handleAddMember() {
    const name = document.getElementById('memberName').value;
    const dob = document.getElementById('memberDob').value;
    const photo = document.getElementById('memberPhoto').value;
    const generation = parseInt(document.getElementById('memberGeneration').value);
    const description = document.getElementById('memberDescription').value;
    
    if (!name || !dob) {
        alert('Please fill in the required fields (Name and Date of Birth)');
        return;
    }
    
    const newMember = {
        id: mockDatabase.familyMembers.length + 1,
        userId: currentUser.id,
        fullName: name,
        dateOfBirth: dob,
        description: description || '',
        profilePhoto: photo || '',
        photos: [],
        generation: generation,
        parentId: null,
        spouseId: null
    };
    
    mockDatabase.familyMembers.push(newMember);
    familyMembers.push(newMember);
    
    // Reset form
    document.getElementById('memberName').value = '';
    document.getElementById('memberDob').value = '';
    document.getElementById('memberPhoto').value = '';
    document.getElementById('memberGeneration').value = '0';
    document.getElementById('memberDescription').value = '';
    
    // Go back to tree view
    showView('tree');
    renderFamilyTree();
}

// Utility Functions
function calculateAge(dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
}

// Error Handling
window.addEventListener('error', function(e) {
    console.error('Application error:', e.error);
});

// Responsive handling
window.addEventListener('resize', function() {
    // Handle responsive adjustments if needed
    const modal = document.getElementById('memberModal');
    if (modal.classList.contains('active')) {
        // Adjust modal positioning if needed
    }
});

// Prevent default form submissions
document.addEventListener('submit', function(e) {
    e.preventDefault();
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Close modal with Escape key
    if (e.key === 'Escape') {
        closeModal();
    }
    
    // Quick navigation with Ctrl+key combinations
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case '1':
                e.preventDefault();
                if (currentUser) showView('tree');
                break;
            case '2':
                e.preventDefault();
                if (currentUser) showView('add');
                break;
        }
    }
});