import { api } from './api';

// Background service to store transactions from RPC to database
export class TransactionStorageService {
	private intervalId: NodeJS.Timeout | null = null;
	private isRunning = false;

	start() {
		if (this.isRunning) return;
		
		this.isRunning = true;
		console.log('Starting transaction storage service...');
		
		// Store transactions immediately
		this.storeTransactions();
		
		// Then store every 2 minutes (for testing)
		this.intervalId = setInterval(() => {
			this.storeTransactions();
		}, 120000);
	}

	stop() {
		if (this.intervalId) {
			clearInterval(this.intervalId);
			this.intervalId = null;
		}
		this.isRunning = false;
		console.log('Transaction storage service stopped');
	}

	private async storeTransactions() {
		try {
			console.log('Attempting to store latest transactions...');
			await api.storeLatestTransactions();
			console.log('Successfully stored latest transactions to database');
		} catch (error) {
			console.error('Failed to store transactions:', error);
		}
	}
}

// Create singleton instance
export const transactionStorageService = new TransactionStorageService();
