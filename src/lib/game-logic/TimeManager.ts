import { GameState } from './types';

export class TimeManager {
    private state: GameState;
    private readonly HOURS_PER_DAY = 24;
    private readonly PERIODS = {
        morning: { start: 6, end: 11 },
        afternoon: { start: 12, end: 17 },
        evening: { start: 18, end: 21 },
        night: { start: 22, end: 5 }
    };

    constructor(state: GameState) {
        this.state = state;
    }

    updateState(newState: GameState): void {
        this.state = newState;
    }

    advanceTime(hours: number): void {
        this.state.currentTime += hours;
        
        // Handle day transition
        if (this.state.currentTime >= this.HOURS_PER_DAY) {
            this.state.currentDay += Math.floor(this.state.currentTime / this.HOURS_PER_DAY);
            this.state.currentTime = this.state.currentTime % this.HOURS_PER_DAY;
        }

        // Update time period
        this.updateTimePeriod();
    }

    setTimePeriod(period: string): void {
        if (period in this.PERIODS) {
            this.state.currentPeriod = period;
            // Set time to the middle of the period
            const periodInfo = this.PERIODS[period as keyof typeof this.PERIODS];
            this.state.currentTime = Math.floor((periodInfo.start + periodInfo.end) / 2);
        }
    }

    private updateTimePeriod(): void {
        const currentHour = this.state.currentTime;
        
        for (const [period, range] of Object.entries(this.PERIODS)) {
            if (range.start <= currentHour && currentHour <= range.end) {
                this.state.currentPeriod = period;
                break;
            }
        }
    }

    getCurrentTime(): number {
        return this.state.currentTime;
    }

    getCurrentDay(): number {
        return this.state.currentDay;
    }

    getCurrentPeriod(): string {
        return this.state.currentPeriod;
    }

    getTimeString(): string {
        const hours = Math.floor(this.state.currentTime);
        const minutes = Math.floor((this.state.currentTime % 1) * 60);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    getDayString(): string {
        return `Day ${this.state.currentDay}`;
    }

    isTimeInRange(start: number, end: number): boolean {
        return this.state.currentTime >= start && this.state.currentTime <= end;
    }

    getTimeUntilPeriod(period: string): number {
        if (!(period in this.PERIODS)) {
            return 0;
        }

        const periodInfo = this.PERIODS[period as keyof typeof this.PERIODS];
        let hoursUntil = periodInfo.start - this.state.currentTime;

        if (hoursUntil < 0) {
            hoursUntil += this.HOURS_PER_DAY;
        }

        return hoursUntil;
    }
} 