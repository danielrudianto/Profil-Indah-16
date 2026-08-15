import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SideNavService {
  private readonly STORAGE_KEY = 'sideNavOpen';
  private isOpen = new BehaviorSubject<boolean>(this.getInitialState());

  constructor() {
    // Set initial state based on window width
    this.updateSideNavState(window.innerWidth);
  }

  isOpen$ = this.isOpen.asObservable();

  toggle() {
    const newState = !this.isOpen.value;
    this.setState(newState);
  }

  // Method to set the side nav state directly
  setState(isOpen: boolean) {
    this.isOpen.next(isOpen);
    this.saveState(isOpen);
  }

  // Method to update side nav state based on window width
  updateSideNavState(width: number) {
    if (width < 768) {
      this.setState(false);
    } else {
      // If the width is greater than or equal to 768, use the stored state
      const storedState = this.getStoredState();
      if (storedState !== null) {
        this.isOpen.next(storedState);
      }
    }
  }

  // Helper method to get initial state from localStorage
  /*
    Bawaannya TERBUKA pada layar lebar, bukan tertutup.

    Sebelumnya selalu tertutup ketika belum ada pilihan tersimpan. Dulu itu
    tidak fatal — menunya masih bisa dibuka lewat tombol, dan halaman launcher
    menyediakan jalan lain. Sejak launcher dibuang, navigasi samping menjadi
    satu-satunya jalan berpindah halaman, dan layar pertama yang menyembunyikannya
    terbaca seperti aplikasi yang gagal dimuat.

    Pada layar sempit tetap tertutup: di sana drawer menutupi seluruh isi.
  */
  private getInitialState(): boolean {
    const storedState = this.getStoredState();
    if (storedState !== null) {
      return storedState;
    }
    return window.innerWidth >= 768;
  }

  // Helper method to get stored state from localStorage
  private getStoredState(): boolean | null {
    const storedState = localStorage.getItem(this.STORAGE_KEY);
    return storedState !== null ? JSON.parse(storedState) : null;
  }

  // Helper method to save state to localStorage
  private saveState(isOpen: boolean) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(isOpen));
  }
}
