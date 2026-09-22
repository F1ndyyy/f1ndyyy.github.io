/**
 * NIKBOWLING — Штат сотрудников и пирамида
 */
const CONFIG = {
    SUPABASE_URL: 'https://fdvgqonhlvonksbgfkez.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkdmdxb25obHZvbmtzYmdma2V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3MzkyNDEsImV4cCI6MjEwMzMxNTI0MX0.9ZUU-Zka9RbERVTzkeJW4_qcbSW7x9ITHbRnY8D6hS8' 
};

document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY_USER = 'nb_current_user';
    let supabaseClient = null;

    if (CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY && window.supabase) {
        supabaseClient = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
    }

    const getCurrentUser = () => {
        const stored = localStorage.getItem(STORAGE_KEY_USER);
        return stored ? JSON.parse(stored) : null;
    };

    const userProfileMenu = document.getElementById('userProfileMenu');
    const userDisplayName = document.getElementById('userDisplayName');
    const userRoleBadge = document.getElementById('userRoleBadge');
    const userAvatarText = document.getElementById('userAvatarText');
    const logoutBtn = document.getElementById('logoutBtn');

    const openAddStaffModalBtn = document.getElementById('openAddStaffModalBtn');
    const addStaffModal = document.getElementById('addStaffModal');
    const closeAddStaffModalBtn = document.getElementById('closeAddStaffModalBtn');
    const addStaffForm = document.getElementById('addStaffForm');

    const tier1Container = document.getElementById('tier1Container');
    const tier2Container = document.getElementById('tier2Container');
    const tier3Container = document.getElementById('tier3Container');

    let staffMembers = [];

    // Проверка прав администратора
    function checkAuth() {
        const user = getCurrentUser();
        if (user) {
            userProfileMenu.style.display = 'flex';
            userDisplayName.textContent = user.name;
            userRoleBadge.textContent = user.role === 'admin' ? 'Глав.Инженер' : 'Клиент';
            userAvatarText.textContent = user.name.charAt(0).toUpperCase();

            if (user.role === 'admin') {
                openAddStaffModalBtn.style.display = 'inline-flex';
            }
        }
    }

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem(STORAGE_KEY_USER);
        window.location.reload();
    });

    // Загрузка штата
    async function loadStaff() {
        if (supabaseClient) {
            const { data, error } = await supabaseClient
                .from('staff')
                .select('*')
                .order('id', { ascending: true });
            
            if (!error && data) {
                staffMembers = data;
            }
        } else {
            staffMembers = [
                { id: 1, name: 'Никита', position: 'Главный Инженер / Руководитель службы', level: 1, phone: '+7 985 289 54 50', telegram: '@Yakovlevofficial1', created_at: '2026' },
                { id: 2, name: 'Алексей В.', position: 'Ведущий инженер ПО Steltronic & Электроника', level: 2, phone: '+7 900 000 00 01', telegram: '@alex_stel', created_at: '2026' },
                { id: 3, name: 'Дмитрий С.', position: 'Старший механик пинсеттеров QubicaAMF / VIA', level: 2, phone: '+7 900 000 00 02', telegram: '@dmitry_amf', created_at: '2026' },
                { id: 4, name: 'Иван К.', position: 'Дежурный техник дорожек', level: 3, phone: '', telegram: '', created_at: '2026' },
                { id: 5, name: 'Максим Р.', position: 'Механик шароподъемников и трасс', level: 3, phone: '', telegram: '', created_at: '2026' },
                { id: 6, name: 'Сергей М.', position: 'Техник ТО и профилактики', level: 3, phone: '', telegram: '', created_at: '2026' }
            ];
        }

        renderPyramid();
    }

    // Отрисовка уровней пирамиды
    function renderPyramid() {
        const user = getCurrentUser();
        const isAdmin = user && user.role === 'admin';

        tier1Container.innerHTML = '';
        tier2Container.innerHTML = '';
        tier3Container.innerHTML = '';

        staffMembers.forEach(person => {
            const card = document.createElement('div');
            card.className = `staff-card tier-${person.level}-card`;

            // Было:
            // const avatarHtml = person.photo_url 
            //     ? `<img src="${person.photo_url}" alt="${person.name}" class="staff-avatar-img">`
            //     : `<div class="staff-avatar-placeholder">${person.name.charAt(0)}</div>`;

            // Стало (с отключением Referer и обработкой ошибок):
            const firstLetter = person.name ? person.name.charAt(0).toUpperCase() : '?';
            const avatarHtml = person.photo_url 
                ? `<img src="${person.photo_url}" 
                        alt="${person.name}" 
                        class="staff-avatar-img" 
                        referrerpolicy="no-referrer" 
                        onerror="this.outerHTML='<div class=\\'staff-avatar-placeholder\\'>${firstLetter}</div>'">`
                : `<div class="staff-avatar-placeholder">${firstLetter}</div>`;

                
            let contactsHtml = '';
            if (person.phone || person.telegram) {
                contactsHtml = `
                    <div class="staff-contacts">
                        ${person.phone ? `<a href="tel:${person.phone}" class="staff-contact-link">📞 ${person.phone}</a>` : ''}
                        ${person.telegram ? `<a href="https://t.me/${person.telegram.replace('@', '')}" target="_blank" class="staff-contact-link">✈️ ${person.telegram}</a>` : ''}
                    </div>
                `;
            }

            card.innerHTML = `
                <div class="staff-card-top">
                    ${avatarHtml}
                    <div class="staff-meta">
                        <span class="staff-badge">УРОВЕНЬ ${person.level}</span>
                        <h4 class="staff-name">${person.name}</h4>
                        <div class="staff-role">${person.position}</div>
                    </div>
                </div>
                ${contactsHtml}
                ${isAdmin ? `<button class="btn-staff-del" onclick="deleteStaffMember(${person.id})">Удалить из штата</button>` : ''}
            `;

            if (person.level === 1) tier1Container.appendChild(card);
            else if (person.level === 2) tier2Container.appendChild(card);
            else tier3Container.appendChild(card);
        });
    }

    // Добавление сотрудника
    if (addStaffForm) {
        addStaffForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('staffName').value.trim();
            const position = document.getElementById('staffPosition').value.trim();
            const level = parseInt(document.getElementById('staffLevel').value);
            const phone = document.getElementById('staffPhone').value.trim();
            const telegram = document.getElementById('staffTg').value.trim();
            const photo_url = document.getElementById('staffPhoto').value.trim();

            const dateStr = new Date().toLocaleDateString('ru-RU');

            const newStaff = { name, position, level, phone, telegram, photo_url, created_at: dateStr };

            const submitBtn = document.getElementById('submitStaffBtn');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Сохранение...';

            if (supabaseClient) {
                const { error } = await supabaseClient.from('staff').insert([newStaff]);
                if (error) alert('Ошибка сохранения: ' + error.message);
            } else {
                newStaff.id = Date.now();
                staffMembers.push(newStaff);
            }

            addStaffForm.reset();
            addStaffModal.classList.remove('active');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Сохранить в пирамиду';
            await loadStaff();
        });
    }

    // Удаление сотрудника
    window.deleteStaffMember = async (id) => {
        if (confirm('Удалить сотрудника из штатной пирамиды?')) {
            if (supabaseClient) {
                await supabaseClient.from('staff').delete().eq('id', id);
            } else {
                staffMembers = staffMembers.filter(s => s.id !== id);
            }
            await loadStaff();
        }
    };

    openAddStaffModalBtn.addEventListener('click', () => addStaffModal.classList.add('active'));
    closeAddStaffModalBtn.addEventListener('click', () => addStaffModal.classList.remove('active'));
    addStaffModal.addEventListener('click', (e) => {
        if (e.target === addStaffModal) addStaffModal.classList.remove('active');
    });

    checkAuth();
    loadStaff();
});