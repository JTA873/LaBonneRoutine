// Gestionnaire de calendrier moderne et responsive
class ModernCalendar {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.currentDate = new Date();
        this.selectedDate = null;
        this.availableSlots = new Map();
        this.bookedSlots = new Map();
        
        this.options = {
            locale: 'fr-FR',
            firstDayOfWeek: 1, // Lundi
            minDate: new Date(),
            maxDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 mois
            ...options
        };
        
        this.monthNames = [
            'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
        ];
        
        this.dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
        
        this.init();
    }
    
    init() {
        this.render();
        this.attachEvents();
        this.loadAvailableSlots();
        
        // Touch events pour mobile
        this.initTouchGestures();
    }
    
    render() {
        this.container.innerHTML = `
            <div class="calendar-widget">
                <div class="calendar-header">
                    <button class="calendar-nav calendar-prev" type="button" aria-label="Mois précédent">
                        <i data-lucide="chevron-left"></i>
                    </button>
                    <div class="calendar-title">
                        <h3 class="calendar-month">${this.monthNames[this.currentDate.getMonth()]}</h3>
                        <span class="calendar-year">${this.currentDate.getFullYear()}</span>
                    </div>
                    <button class="calendar-nav calendar-next" type="button" aria-label="Mois suivant">
                        <i data-lucide="chevron-right"></i>
                    </button>
                </div>
                
                <div class="calendar-weekdays">
                    ${this.dayNames.map(day => `<div class="calendar-weekday">${day}</div>`).join('')}
                </div>
                
                <div class="calendar-grid" role="grid">
                    ${this.renderCalendarDays()}
                </div>
                
                <div class="calendar-legend">
                    <div class="legend-item">
                        <span class="legend-dot available"></span>
                        <span>Disponible</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-dot limited"></span>
                        <span>Places limitées</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-dot booked"></span>
                        <span>Complet</span>
                    </div>
                </div>
            </div>
            
            <div class="time-slots-section" style="display: none;">
                <h4 class="slots-title">Créneaux disponibles</h4>
                <div class="time-slots-grid" id="timeSlots">
                    <!-- Les créneaux seront chargés dynamiquement -->
                </div>
            </div>
        `;
        
        // Réinitialiser les icônes Lucide
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    renderCalendarDays() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        
        // Ajuster le premier jour pour commencer lundi
        let startDay = firstDay.getDay();
        startDay = startDay === 0 ? 6 : startDay - 1;
        
        let html = '';
        let dayCount = 1;
        
        // Jours du mois précédent
        const prevMonth = new Date(year, month - 1, 0);
        const daysInPrevMonth = prevMonth.getDate();
        
        for (let i = startDay - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            html += `<div class="calendar-day prev-month">${day}</div>`;
        }
        
        // Jours du mois courant
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = this.formatDate(date);
            const isToday = this.isToday(date);
            const isSelected = this.selectedDate && this.formatDate(this.selectedDate) === dateStr;
            const isPast = date < this.options.minDate;
            const isFuture = date > this.options.maxDate;
            const isDisabled = isPast || isFuture;
            
            let classes = ['calendar-day'];
            let attributes = '';
            
            if (isToday) classes.push('today');
            if (isSelected) classes.push('selected');
            if (isDisabled) classes.push('disabled');
            
            // Vérifier la disponibilité
            const availability = this.getDateAvailability(date);
            if (!isDisabled) {
                classes.push(availability);
                if (availability !== 'unavailable') {
                    attributes = `data-date="${dateStr}" role="gridcell" tabindex="0"`;
                }
            }
            
            html += `
                <div class="${classes.join(' ')}" ${attributes}>
                    <span class="day-number">${day}</span>
                    ${!isDisabled && availability !== 'unavailable' ? '<span class="availability-indicator"></span>' : ''}
                </div>
            `;
        }
        
        // Jours du mois suivant pour compléter la grille
        const totalCells = Math.ceil((startDay + daysInMonth) / 7) * 7;
        const remainingCells = totalCells - (startDay + daysInMonth);
        
        for (let day = 1; day <= remainingCells; day++) {
            html += `<div class="calendar-day next-month">${day}</div>`;
        }
        
        return html;
    }
    
    attachEvents() {
        // Navigation
        this.container.querySelector('.calendar-prev').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.render();
            this.attachEvents();
        });
        
        this.container.querySelector('.calendar-next').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.render();
            this.attachEvents();
        });
        
        // Sélection de date
        this.container.addEventListener('click', (e) => {
            const dayElement = e.target.closest('.calendar-day[data-date]');
            if (dayElement && !dayElement.classList.contains('disabled')) {
                this.selectDate(dayElement.dataset.date);
            }
        });
        
        // Navigation clavier
        this.container.addEventListener('keydown', (e) => {
            if (e.target.classList.contains('calendar-day')) {
                this.handleKeyNavigation(e);
            }
        });
    }
    
    initTouchGestures() {
        let startX = null;
        let currentX = null;
        let isDragging = false;
        
        const calendarGrid = this.container.querySelector('.calendar-grid');
        
        calendarGrid.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
        }, { passive: true });
        
        calendarGrid.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentX = e.touches[0].clientX;
        }, { passive: true });
        
        calendarGrid.addEventListener('touchend', () => {
            if (!isDragging || !startX || !currentX) return;
            
            const diffX = startX - currentX;
            const threshold = 50;
            
            if (Math.abs(diffX) > threshold) {
                if (diffX > 0) {
                    // Swipe left - mois suivant
                    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
                } else {
                    // Swipe right - mois précédent
                    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
                }
                this.render();
                this.attachEvents();
            }
            
            startX = null;
            currentX = null;
            isDragging = false;
        }, { passive: true });
    }
    
    selectDate(dateStr) {
        // Retirer la sélection précédente
        this.container.querySelectorAll('.calendar-day.selected').forEach(el => {
            el.classList.remove('selected');
        });
        
        // Ajouter la nouvelle sélection
        const dayElement = this.container.querySelector(`[data-date="${dateStr}"]`);
        if (dayElement) {
            dayElement.classList.add('selected');
            this.selectedDate = new Date(dateStr);
            
            // Charger les créneaux pour cette date
            this.loadTimeSlotsForDate(this.selectedDate);
            
            // Animer vers la section des créneaux
            const slotsSection = this.container.querySelector('.time-slots-section');
            slotsSection.style.display = 'block';
            slotsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            
            // Événement personnalisé
            this.container.dispatchEvent(new CustomEvent('dateSelected', {
                detail: { date: this.selectedDate, dateString: dateStr }
            }));
        }
    }
    
    async loadTimeSlotsForDate(date) {
        const slotsContainer = this.container.querySelector('#timeSlots');
        slotsContainer.innerHTML = '<div class="loading-slots">Chargement des créneaux...</div>';
        
        try {
            // Simuler le chargement des créneaux depuis Firebase
            const slots = await this.fetchSlotsForDate(date);
            
            if (slots.length === 0) {
                slotsContainer.innerHTML = `
                    <div class="no-slots">
                        <i data-lucide="calendar-x"></i>
                        <p>Aucun créneau disponible pour cette date</p>
                    </div>
                `;
            } else {
                slotsContainer.innerHTML = slots.map(slot => `
                    <div class="time-slot ${slot.available ? 'available' : 'booked'}" 
                         data-slot-id="${slot.id}"
                         ${slot.available ? 'tabindex="0" role="button"' : ''}>
                        <div class="slot-time">${slot.time}</div>
                        <div class="slot-info">
                            <div class="slot-title">${slot.title}</div>
                            <div class="slot-details">
                                <span class="slot-duration">${slot.duration}</span>
                                <span class="slot-location">${slot.location}</span>
                            </div>
                            <div class="slot-price">${slot.price}€</div>
                        </div>
                        <div class="slot-status">
                            ${slot.available ? 
                                `<span class="available-spots">${slot.spotsLeft} places</span>` : 
                                '<span class="booked-status">Complet</span>'
                            }
                        </div>
                    </div>
                `).join('');
                
                // Ajouter les événements de clic sur les créneaux
                slotsContainer.querySelectorAll('.time-slot.available').forEach(slot => {
                    slot.addEventListener('click', () => {
                        this.selectTimeSlot(slot.dataset.slotId);
                    });
                });
            }
            
            // Réinitialiser les icônes Lucide
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
            
        } catch (error) {
            console.error('Erreur lors du chargement des créneaux:', error);
            slotsContainer.innerHTML = `
                <div class="error-slots">
                    <i data-lucide="alert-circle"></i>
                    <p>Erreur lors du chargement des créneaux</p>
                    <button class="btn btn-sm btn-outline" onclick="calendar.loadTimeSlotsForDate(calendar.selectedDate)">
                        Réessayer
                    </button>
                </div>
            `;
        }
    }
    
    async fetchSlotsForDate(date) {
        // Simuler des données pour le développement
        const mockSlots = [
            {
                id: 'slot1',
                time: '09:00',
                title: 'Coaching Personnel',
                duration: '1h',
                location: 'Salle A',
                price: 50,
                available: true,
                spotsLeft: 1
            },
            {
                id: 'slot2',
                time: '11:00',
                title: 'Cours de Groupe',
                duration: '45min',
                location: 'Salle B',
                price: 25,
                available: true,
                spotsLeft: 3
            },
            {
                id: 'slot3',
                time: '14:00',
                title: 'Yoga Relaxation',
                duration: '1h30',
                location: 'Studio',
                price: 30,
                available: false,
                spotsLeft: 0
            },
            {
                id: 'slot4',
                time: '18:00',
                title: 'HIIT Training',
                duration: '45min',
                location: 'Salle A',
                price: 35,
                available: true,
                spotsLeft: 2
            }
        ];
        
        // Simuler un délai de chargement
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return mockSlots;
    }
    
    selectTimeSlot(slotId) {
        // Retirer la sélection précédente
        this.container.querySelectorAll('.time-slot.selected').forEach(el => {
            el.classList.remove('selected');
        });
        
        // Ajouter la nouvelle sélection
        const slotElement = this.container.querySelector(`[data-slot-id="${slotId}"]`);
        if (slotElement) {
            slotElement.classList.add('selected');
            
            // Afficher le bouton de réservation
            this.showBookingButton(slotId);
            
            // Événement personnalisé
            this.container.dispatchEvent(new CustomEvent('slotSelected', {
                detail: { slotId, date: this.selectedDate }
            }));
        }
    }
    
    showBookingButton(slotId) {
        // Supprimer le bouton existant s'il y en a un
        const existingButton = this.container.querySelector('.booking-button-container');
        if (existingButton) {
            existingButton.remove();
        }
        
        // Créer le nouveau bouton
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'booking-button-container';
        buttonContainer.innerHTML = `
            <button class="btn btn-primary btn-lg booking-btn" type="button">
                <i data-lucide="calendar-check"></i>
                Réserver ce créneau
            </button>
            <p class="booking-note">Confirmation immédiate par email</p>
        `;
        
        // Ajouter l'événement de clic
        const bookingBtn = buttonContainer.querySelector('.booking-btn');
        bookingBtn.addEventListener('click', () => {
            this.bookSlot(slotId);
        });
        
        // Insérer après la grille des créneaux
        const slotsContainer = this.container.querySelector('#timeSlots');
        slotsContainer.parentNode.insertBefore(buttonContainer, slotsContainer.nextSibling);
        
        // Animation d'apparition
        setTimeout(() => {
            buttonContainer.classList.add('show');
        }, 10);
        
        // Réinitialiser les icônes Lucide
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    async bookSlot(slotId) {
        const bookingBtn = this.container.querySelector('.booking-btn');
        const originalText = bookingBtn.innerHTML;
        
        // État de chargement
        bookingBtn.innerHTML = '<div class="spinner"></div> Réservation...';
        bookingBtn.disabled = true;
        
        try {
            // Simuler la réservation
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Succès
            bookingBtn.innerHTML = '<i data-lucide="check"></i> Réservé !';
            bookingBtn.classList.remove('btn-primary');
            bookingBtn.classList.add('btn-success');
            
            // Afficher la confirmation
            setTimeout(() => {
                this.showBookingConfirmation(slotId);
            }, 1000);
            
        } catch (error) {
            console.error('Erreur lors de la réservation:', error);
            bookingBtn.innerHTML = originalText;
            bookingBtn.disabled = false;
            
            // Afficher l'erreur
            if (window.app) {
                window.app.showMessage('Erreur lors de la réservation', 'error');
            }
        }
    }
    
    showBookingConfirmation(slotId) {
        const modal = document.createElement('div');
        modal.className = 'modal booking-confirmation-modal show';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">Réservation confirmée !</h3>
                </div>
                <div class="modal-body">
                    <div class="confirmation-icon">
                        <i data-lucide="check-circle"></i>
                    </div>
                    <p>Votre réservation a été confirmée avec succès.</p>
                    <p>Un email de confirmation vous a été envoyé.</p>
                    
                    <div class="booking-summary">
                        <h4>Récapitulatif :</h4>
                        <div class="summary-item">
                            <span>Date :</span>
                            <span>${this.formatDate(this.selectedDate, { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                        </div>
                        <div class="summary-item">
                            <span>Créneau :</span>
                            <span id="selectedSlotInfo">Chargement...</span>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="this.closest('.modal').remove()">
                        Parfait !
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Réinitialiser les icônes Lucide
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        // Fermer la modal en cliquant à l'extérieur
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    // Méthodes utilitaires
    formatDate(date, options = {}) {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        
        if (Object.keys(options).length > 0) {
            return date.toLocaleDateString(this.options.locale, options);
        }
        
        return date.toISOString().split('T')[0];
    }
    
    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }
    
    getDateAvailability(date) {
        // Simuler la disponibilité
        const dayOfWeek = date.getDay();
        
        // Fermé le dimanche
        if (dayOfWeek === 0) return 'unavailable';
        
        // Disponibilité aléatoire pour la démo
        const random = Math.random();
        if (random < 0.7) return 'available';
        if (random < 0.9) return 'limited';
        return 'booked';
    }
    
    handleKeyNavigation(e) {
        const currentDay = e.target;
        const allDays = Array.from(this.container.querySelectorAll('.calendar-day[data-date]'));
        const currentIndex = allDays.indexOf(currentDay);
        
        let targetIndex = currentIndex;
        
        switch (e.key) {
            case 'ArrowLeft':
                targetIndex = Math.max(0, currentIndex - 1);
                break;
            case 'ArrowRight':
                targetIndex = Math.min(allDays.length - 1, currentIndex + 1);
                break;
            case 'ArrowUp':
                targetIndex = Math.max(0, currentIndex - 7);
                break;
            case 'ArrowDown':
                targetIndex = Math.min(allDays.length - 1, currentIndex + 7);
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                this.selectDate(currentDay.dataset.date);
                return;
            default:
                return;
        }
        
        e.preventDefault();
        if (allDays[targetIndex]) {
            allDays[targetIndex].focus();
        }
    }
    
    // API publique
    goToDate(date) {
        this.currentDate = new Date(date);
        this.render();
        this.attachEvents();
    }
    
    getSelectedDate() {
        return this.selectedDate;
    }
    
    refresh() {
        this.render();
        this.attachEvents();
        this.loadAvailableSlots();
    }
}

// Export pour utilisation globale
window.ModernCalendar = ModernCalendar;
