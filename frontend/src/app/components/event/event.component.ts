import { Component, OnInit, inject } from '@angular/core';
import { COUNTRY_LIST } from '../../constants';
import { EventService } from '../../services/event.service';
import { Observable } from 'rxjs';
import { Events } from '../../models';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrl: './event.component.css'
})
export class EventComponent implements OnInit {

  selected: string = ''
  countries!: { name: string, code: string}[]

  events$!: Observable<Events[]>
  searchForm!: FormGroup
  private fb =  inject(FormBuilder)

  page=0
  size=20
  hasNextPage = true
  hasPreviousPage = false
  lastPage: number = 0

  private eventSvc = inject(EventService)
  private router = inject(Router)

  ngOnInit(): void {
    this.getCountries()
    this.loadEvents()
    this.loadLastPageNumber() 

    this.searchForm = this.fb.group({
      keyword: this.fb.control<string>('')
    })
  }

  getCountries(): void {
    this.countries = Object.entries(COUNTRY_LIST).map(([name, code]) => ({
      name,
      code
    }));
  }

  onCountrySelect(event: any): void {
    const countryCode = this.getCountryCodeByName(event.target.value);
    if (countryCode) {
      this.selected = countryCode
      this.page = 0 // Reset page number when country changes
      this.loadLastPageNumber()
      this.loadEvents()
    }
  }

  private getCountryCodeByName(countryName: string): string | undefined {
    const country = this.countries.find(country => country.name === countryName)
    return country ? country.code: undefined
  }

  loadEvents(): void {
    if (this.selected) {
      this.events$ = this.eventSvc.getEventsByCountry(this.selected, this.page, this.size)
      this.events$.subscribe(events => {
        // Disable next button if there are no events
        this.hasNextPage = events.length > 0
      })
    } else {
      this.loadAllEvents()
    }
  }

  loadAllEvents(): void {
    this.events$ = this.eventSvc.getAllEvents(this.page, this.size);
    this.events$.subscribe(events => {
      // Disable next button if there are no events
      this.hasNextPage = events.length > 0;
    })
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
    this.eventSvc.getLastPage(this.selected)
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

  onSearch(): void{
    const keyword = this.searchForm.get('keyword')?.value
    console.log("keyword", keyword)
    // Redirect to the SearchComponent with the keyword as a query parameter
    this.router.navigate(['/search', keyword])
  }

  formatTime(time: string): string {
    const [hours, minutes] = time.split(':').map(Number)
    const amPm = hours >= 12 ? 'PM' : 'AM'
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12
    return `${formattedHours}:${minutes < 10 ? '0' + minutes : minutes} ${amPm}`
  }


}