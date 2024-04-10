import { Component, OnInit, inject } from '@angular/core';
import { Events } from '../../models';
import { Observable } from 'rxjs';
import { EventService } from '../../services/event.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent implements OnInit{

  keyword!: string;
  searchResults$!: Observable<Events[]>

  page=0
  size=20
  hasNextPage = true
  hasPreviousPage = false
  lastPage: number = 0

  private eventSvc = inject(EventService)
  private route = inject(ActivatedRoute)
  private router = inject(Router)

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.keyword = params['keyword']
      this.loadEvents()
    })
  }

  loadEvents(): void {
    if (this.keyword) {
      this.searchResults$ = this.eventSvc.getEventsBySearch(this.keyword, this.page, this.size);
      this.searchResults$.subscribe(events => {
        this.hasNextPage = events.length >= this.size // Update hasNextPage based on the number of events received
        this.hasPreviousPage = this.page > 0 // Enable previous page if page is greater than 0
      })
    }
  }

  loadNextPage(): void {
    if (this.hasNextPage) {
      this.page++;
      console.log('Next page:', this.page)
      this.loadEvents()
      this.loadLastPageNumber()
      // Disable next button if current page is equal to the last page
      this.hasNextPage = this.page < this.lastPage
      // Enable previous button as we are going to the next page
      this.hasPreviousPage = true;
    }
  }

  loadPreviousPage(): void {
    if (this.page > 0) {
      this.page--
      console.log('Previous page:', this.page)
      this.loadEvents()
      // Enable next button when navigating back
      this.hasNextPage = true
      // Disable previous button if current page is 0
      this.hasPreviousPage = this.page > 0;
    }
  }

  loadLastPageNumber(): void {
    this.eventSvc.getLastPage(this.keyword)
      .subscribe((lastPageNumber:number) => {
          this.lastPage = lastPageNumber;
          console.log('Last page number:', this.lastPage)
          // Disable next button if current page is equal to the last page
          this.hasNextPage = !(this.page === 0 && this.lastPage === 1)
          // Disable previous button if current page is 0
          this.hasPreviousPage = this.page > 0

        }),
        ((error:any) => {
          console.error('Error loading last page number:', error)
        }
      )
  }

  formatTime(time: string): string {
    const [hours, minutes] = time.split(':').map(Number)
    const amPm = hours >= 12 ? 'PM' : 'AM'
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12
    return `${formattedHours}:${minutes < 10 ? '0' + minutes : minutes} ${amPm}`
  }

  onEventClick(eventId: string): void {
    // Navigate to the event details page with the event ID as a route parameter
    this.router.navigate(['/event-details', eventId])
  }

}
