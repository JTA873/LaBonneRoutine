// Gestion des réservations (slots et bookings)
import { db } from './firebase-init.js';
import { getCurrentUser } from './auth.js';
import { COLLECTIONS, STATUS } from './config.js';
import { showToast, handleError, setCache, getCache } from './ui.js';
import { 
    collection, 
    doc, 
    addDoc, 
    updateDoc, 
    deleteDoc,
    getDocs, 
    getDoc,
    query, 
    where, 
    orderBy, 
    limit,
    serverTimestamp,
    runTransaction,
    writeBatch
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

// Load available slots
export async function loadSlots() {
    try {
        // Check cache first
        const cached = getCache('slots');
        if (cached) {
            return cached;
        }
        
        const slotsQuery = query(
            collection(db, COLLECTIONS.SLOTS),
            where('status', '==', STATUS.OPEN),
            where('startAt', '>=', new Date()),
            orderBy('startAt', 'asc')
        );
        
        const snapshot = await getDocs(slotsQuery);
        const slots = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        // Cache for 5 minutes
        setCache('slots', slots, 5 * 60 * 1000);
        
        return slots;
    } catch (error) {
        handleError(error, 'loadSlots');
        return [];
    }
}

// Get unique locations from slots
export async function getLocations() {
    try {
        const slots = await loadSlots();
        const locations = [...new Set(slots.map(slot => slot.location))];
        return locations.sort();
    } catch (error) {
        handleError(error, 'getLocations');
        return [];
    }
}

// Book a slot
export async function bookSlot(slotId) {
    const user = getCurrentUser();
    if (!user) {
        throw new Error('Vous devez être connecté pour réserver');
    }
    
    try {
        await runTransaction(db, async (transaction) => {
            const slotRef = doc(db, COLLECTIONS.SLOTS, slotId);
            const slotDoc = await transaction.get(slotRef);
            
            if (!slotDoc.exists()) {
                throw new Error('Créneau non trouvé');
            }
            
            const slotData = slotDoc.data();
            
            // Check if slot is still available
            if (slotData.status !== STATUS.OPEN) {
                throw new Error('Ce créneau n\'est plus disponible');
            }
            
            if (slotData.bookedCount >= slotData.capacity) {
                throw new Error('Ce créneau est complet');
            }
            
            // Check if user already has a booking for this slot
            const existingBookingQuery = query(
                collection(db, COLLECTIONS.BOOKINGS),
                where('slotId', '==', slotId),
                where('userId', '==', user.uid),
                where('status', '==', STATUS.ACTIVE)
            );
            
            const existingBookings = await getDocs(existingBookingQuery);
            if (!existingBookings.empty) {
                throw new Error('Vous avez déjà réservé ce créneau');
            }
            
            // Create booking
            const bookingRef = doc(collection(db, COLLECTIONS.BOOKINGS));
            transaction.set(bookingRef, {
                slotId: slotId,
                userId: user.uid,
                userEmail: user.email,
                userName: user.displayName || user.email,
                status: STATUS.ACTIVE,
                createdAt: serverTimestamp()
            });
            
            // Update slot booked count
            transaction.update(slotRef, {
                bookedCount: slotData.bookedCount + 1
            });
        });
        
        // Clear cache
        setCache('slots', null);
        setCache(`user-bookings-${user.uid}`, null);
        
        showToast('Réservation confirmée !', 'success');
    } catch (error) {
        handleError(error, 'bookSlot');
        throw error;
    }
}

// Cancel a booking
export async function cancelBooking(bookingId) {
    const user = getCurrentUser();
    if (!user) {
        throw new Error('Vous devez être connecté');
    }
    
    try {
        await runTransaction(db, async (transaction) => {
            const bookingRef = doc(db, COLLECTIONS.BOOKINGS, bookingId);
            const bookingDoc = await transaction.get(bookingRef);
            
            if (!bookingDoc.exists()) {
                throw new Error('Réservation non trouvée');
            }
            
            const bookingData = bookingDoc.data();
            
            // Check ownership
            if (bookingData.userId !== user.uid) {
                throw new Error('Vous ne pouvez pas annuler cette réservation');
            }
            
            if (bookingData.status !== STATUS.ACTIVE) {
                throw new Error('Cette réservation ne peut pas être annulée');
            }
            
            // Get slot data
            const slotRef = doc(db, COLLECTIONS.SLOTS, bookingData.slotId);
            const slotDoc = await transaction.get(slotRef);
            
            if (slotDoc.exists()) {
                const slotData = slotDoc.data();
                
                // Update slot booked count
                transaction.update(slotRef, {
                    bookedCount: Math.max(0, slotData.bookedCount - 1)
                });
            }
            
            // Update booking status
            transaction.update(bookingRef, {
                status: STATUS.CANCELED,
                canceledAt: serverTimestamp()
            });
        });
        
        // Clear cache
        setCache('slots', null);
        setCache(`user-bookings-${user.uid}`, null);
        
        showToast('Réservation annulée', 'success');
    } catch (error) {
        handleError(error, 'cancelBooking');
        throw error;
    }
}

// Get user bookings
export async function getUserBookings() {
    const user = getCurrentUser();
    if (!user) return [];
    
    try {
        // Check cache first
        const cached = getCache(`user-bookings-${user.uid}`);
        if (cached) {
            return cached;
        }
        
        const bookingsQuery = query(
            collection(db, COLLECTIONS.BOOKINGS),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
        );
        
        const snapshot = await getDocs(bookingsQuery);
        const bookings = [];
        
        for (const bookingDoc of snapshot.docs) {
            const bookingData = bookingDoc.data();
            
            // Get associated slot data
            const slotDoc = await getDoc(doc(db, COLLECTIONS.SLOTS, bookingData.slotId));
            
            if (slotDoc.exists()) {
                bookings.push({
                    id: bookingDoc.id,
                    ...bookingData,
                    slot: slotDoc.data()
                });
            }
        }
        
        // Cache for 2 minutes
        setCache(`user-bookings-${user.uid}`, bookings, 2 * 60 * 1000);
        
        return bookings;
    } catch (error) {
        handleError(error, 'getUserBookings');
        return [];
    }
}

// Get all bookings (admin only)
export async function getAllBookings() {
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
        throw new Error('Accès non autorisé');
    }
    
    try {
        const bookingsQuery = query(
            collection(db, COLLECTIONS.BOOKINGS),
            orderBy('createdAt', 'desc')
        );
        
        const snapshot = await getDocs(bookingsQuery);
        const bookings = [];
        
        for (const bookingDoc of snapshot.docs) {
            const bookingData = bookingDoc.data();
            
            // Get associated slot data
            const slotDoc = await getDoc(doc(db, COLLECTIONS.SLOTS, bookingData.slotId));
            
            if (slotDoc.exists()) {
                bookings.push({
                    id: bookingDoc.id,
                    ...bookingData,
                    slot: slotDoc.data()
                });
            }
        }
        
        return bookings;
    } catch (error) {
        handleError(error, 'getAllBookings');
        return [];
    }
}

// Create slot (admin only)
export async function createSlot(slotData) {
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
        throw new Error('Accès non autorisé');
    }
    
    try {
        const docRef = await addDoc(collection(db, COLLECTIONS.SLOTS), {
            ...slotData,
            bookedCount: 0,
            createdAt: serverTimestamp(),
            createdBy: user.uid
        });
        
        // Clear cache
        setCache('slots', null);
        
        return docRef.id;
    } catch (error) {
        handleError(error, 'createSlot');
        throw error;
    }
}

// Update slot (admin only)
export async function updateSlot(slotId, slotData) {
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
        throw new Error('Accès non autorisé');
    }
    
    try {
        await updateDoc(doc(db, COLLECTIONS.SLOTS, slotId), {
            ...slotData,
            updatedAt: serverTimestamp(),
            updatedBy: user.uid
        });
        
        // Clear cache
        setCache('slots', null);
        
    } catch (error) {
        handleError(error, 'updateSlot');
        throw error;
    }
}

// Delete slot (admin only)
export async function deleteSlot(slotId) {
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
        throw new Error('Accès non autorisé');
    }
    
    try {
        // Check if slot has bookings
        const bookingsQuery = query(
            collection(db, COLLECTIONS.BOOKINGS),
            where('slotId', '==', slotId),
            where('status', '==', STATUS.ACTIVE)
        );
        
        const bookingsSnapshot = await getDocs(bookingsQuery);
        
        if (!bookingsSnapshot.empty) {
            throw new Error('Impossible de supprimer un créneau avec des réservations actives');
        }
        
        await deleteDoc(doc(db, COLLECTIONS.SLOTS, slotId));
        
        // Clear cache
        setCache('slots', null);
        
    } catch (error) {
        handleError(error, 'deleteSlot');
        throw error;
    }
}

// Get slot details
export async function getSlotDetails(slotId) {
    try {
        const slotDoc = await getDoc(doc(db, COLLECTIONS.SLOTS, slotId));
        
        if (!slotDoc.exists()) {
            throw new Error('Créneau non trouvé');
        }
        
        return {
            id: slotDoc.id,
            ...slotDoc.data()
        };
    } catch (error) {
        handleError(error, 'getSlotDetails');
        throw error;
    }
}

// Get bookings for a specific slot (admin only)
export async function getSlotBookings(slotId) {
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
        throw new Error('Accès non autorisé');
    }
    
    try {
        const bookingsQuery = query(
            collection(db, COLLECTIONS.BOOKINGS),
            where('slotId', '==', slotId),
            orderBy('createdAt', 'desc')
        );
        
        const snapshot = await getDocs(bookingsQuery);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        handleError(error, 'getSlotBookings');
        return [];
    }
}
