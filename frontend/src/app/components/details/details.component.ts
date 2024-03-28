import { Component, OnInit, inject } from '@angular/core';
import { EventDetails } from '../../models';
import { EventService } from '../../services/event.service';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrl: './details.component.css'
})
export class DetailsComponent implements OnInit{

  eventId!: string;
  eventDetails!: EventDetails[]
  mapUrl: SafeResourceUrl = ''
  private sanitizer = inject(DomSanitizer)

  private eventSvc = inject(EventService)
  private route = inject(ActivatedRoute)

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.eventId = params['id'];
      this.getEventDetails();
    });
  }

  getEventDetails() {
    this.eventSvc.getEventDetails(this.eventId)
      .subscribe(data => {
        this.eventDetails = data;
        console.log(this.eventDetails);
        if (this.eventDetails.length > 0) {
          const venue = this.eventDetails[0].venue;
          this.getMapUrl(venue.name, venue.address)
        }
      });
  }

  getMapUrl(name: string, address: string) {
    this.eventSvc.getMapUrl(name, address)
      .subscribe((url:string) => {
        // Sanitize the URL before assigning it
        this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      })
  }
  
  formatTime(time: string): string {
    const [hours, minutes] = time.split(':').map(Number)
    const amPm = hours >= 12 ? 'PM' : 'AM'
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12
    return `${formattedHours}:${minutes < 10 ? '0' + minutes : minutes} ${amPm}`
  }

}
