import { Component, ViewChild, ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../utils/app.service';
import { ConstantData } from '../../utils/constant-data';
import { Gender, PaymentMode, Status, Category, FlightOption, MealPlan, Title, EnquiryStatus } from '../../utils/enum';
import { LoadDataService } from '../../utils/load-data.service';
import {
	ActionModel,
	RequestModel,
	StaffLoginModel,
} from '../../utils/interface';
import { LocalService } from '../../utils/local.service';
import { ActivatedRoute, Router } from '@angular/router';
// import { Title } from '@angular/platform-browser';
declare var $: any;

@Component({
	selector: 'app-booking',
	templateUrl: './booking.component.html',
	styleUrls: ['./booking.component.css']
})
export class BookingComponent {
	dataLoading: boolean = false;
	EnquiryList: any = [];
	PackageList: any = [];
	// IDTypeList: any = [];
	DestinationList: any = [];
	HotelCategoryList: any = [];
	IDTypeList: any = [];
	AgentList: any = [];
	Patient: any = {};
	Payment: any = {};
	isSubmitted = false;
	PageSize = ConstantData.PageSizes;
	p: number = 1;
	Search: string = '';
	reverse: boolean = false;
	sortKey: string = '';
	itemPerPage: number = this.PageSize[0];
	StateList: any[] = [];
	filterState: any[] = [];
	StatusList = this.loadData.GetEnumList(Status);
	GenderList = this.loadData.GetEnumList(Gender);
	PaymentModeList = this.loadData.GetEnumList(PaymentMode);
	FlightOptionList = this.loadData.GetEnumList(FlightOption);
	MealPlanList = this.loadData.GetEnumList(MealPlan);
	TitleList = this.loadData.GetEnumList(Title);
	EnquiryStutusList = this.loadData.GetEnumList(EnquiryStatus);

	action: ActionModel = {} as ActionModel;
	staffLogin: StaffLoginModel = {} as StaffLoginModel;
	AllStatusList = Status;
	AllGenderList = Gender;
	AllCategoryList = Category;
	AllPaymentModeList = PaymentMode;
	AllFlightOptionList = FlightOption;
	AllMealPlanList = MealPlan;
	AllTitleList = Title;
	AllEnquiryList = EnquiryStatus;
	currentPayment: any = [];
	tempData: any;
	filteredEnquiryList: any = [];
	EnquiryListAll: any;
	// OpticalList: any = [];
	// ChargeList: any;
	Package: any;
	Booking: any = [];
	Guest: any = [];
	DesignationList: any;
	selectedEnquiry: any = null;
	SideEnquiryList: any = [];


	sort(key: any) {
		this.sortKey = key;
		this.reverse = !this.reverse;
	}

	onTableDataChange(p: any) {
		this.p = p;
	}

	constructor(
		private service: AppService,
		private toastr: ToastrService,
		private loadData: LoadDataService,
		private localService: LocalService,
		private router: Router,
		private route: ActivatedRoute
	) { }

	redUrl: string = '';

	ngOnInit(): void {
		this.getEnquiryListall();

		this.staffLogin = this.localService.getEmployeeDetail();
		this.validiateMenu();
		this.resetForm();
		this.getEnquiryList();
		this.getPackageList(this.DestinationList?.[0]?.DestinationId);
		this.getDestinationList();
		this.getHotelCategoryList();
		this.getIDTypeList();
		this.getAgentList();

		// this.route.queryParams.subscribe((params) => {
		//   const OpticalBillingId = params['id'];
		//   const redUrl = params['redUrl'];
		// });
	}
	validiateMenu() {
		var obj: RequestModel = {
			request: this.localService.encrypt(JSON.stringify({ Url: this.router.url, StaffLoginId: this.staffLogin.StaffLoginId })).toString()
		}
		this.dataLoading = true
		this.service.validiateMenu(obj).subscribe((response: any) => {
			this.action = this.loadData.validiateMenu(response, this.toastr, this.router)
			this.dataLoading = false;
		}, (err => {
			this.toastr.error("Error while fetching records")
			this.dataLoading = false;
		}))
	}


	@ViewChild('formBookingDetails') formBookingDetails: NgForm;
	@ViewChild('lblEnquiryCode', { static: false }) lblEnquiryCode!: ElementRef;
	@ViewChild('lblFlightOption', { static: false }) lblFlightOption!: ElementRef;
	resetForm() {
		this.Booking = {};
		// this.Patient.OpdDate = this.loadData.newloadDateYMD(new Date());

		if (this.formBookingDetails) {
			this.formBookingDetails.control.markAsPristine();
			this.formBookingDetails.control.markAsUntouched();
		}
		this.isSubmitted = false;
	}

	//Getting list code 

	getEnquiryList() {
		var obj: RequestModel = {
			request: this.localService.encrypt(JSON.stringify({})).toString(),
		};
		this.dataLoading = true;
		this.service.getEnquiryList(obj).subscribe(
			(r1) => {
				let response = r1 as any;
				if (response.Message == ConstantData.SuccessMessage) {
					this.SideEnquiryList = response.EnquiryList;
				} else {
					this.toastr.error(response.Message);
				}
				this.dataLoading = false;
			},
			(err) => {
				this.toastr.error('Error while fetching records');
			}
		);
	}

	getDestinationList() {
		const request: RequestModel = {
			request: this.localService.encrypt(JSON.stringify({})).toString()
		};
		this.dataLoading = true;
		this.service.getDestinationList(request).subscribe(
			(response: any) => {
				if (response.Message === ConstantData.SuccessMessage) {
					this.DestinationList = response.DestinationList;
					this.filteredDestinationList = [...this.DestinationList]; // set initial list
				} else {
					this.toastr.error(response.Message);
				}
				this.dataLoading = false;
			},
			() => {
				this.toastr.error("Error while fetching records");
				this.dataLoading = false;
			}
		);
	}

	getHotelCategoryList() {
		const request: RequestModel = {
			request: this.localService.encrypt(JSON.stringify({})).toString()
		};
		this.dataLoading = true;
		this.service.getHotelCategoryList(request).subscribe((response: any) => {
			if (response.Message === ConstantData.SuccessMessage) {
				this.HotelCategoryList = response.HotelCategoryList;
				console.log("HotelCategoryList", this.HotelCategoryList);

			} else {
				this.toastr.error(response.Message);
			}
			this.dataLoading = false;
		}, () => {
			this.toastr.error("Error while fetching records");
			this.dataLoading = false;
		});
	}

	getIDTypeList() {
		var obj: RequestModel = {
			request: this.localService.encrypt(JSON.stringify({})).toString()
		}
		this.dataLoading = true
		this.service.getIDTypeList(obj).subscribe(r1 => {
			let response = r1 as any
			if (response.Message == ConstantData.SuccessMessage) {
				this.IDTypeList = response.IDTypeList;
			} else {
				this.toastr.error(response.Message)
			}
			this.dataLoading = false
		}, (err => {
			this.toastr.error("Error while fetching records")
		}))
	}

	getAgentList() {
		var obj: RequestModel = {
			request: this.localService.encrypt(JSON.stringify({})).toString()
		}
		this.dataLoading = true
		this.service.getAgentList(obj).subscribe(r1 => {
			let response = r1 as any
			if (response.Message == ConstantData.SuccessMessage) {
				this.AgentList = response.AgentList;
			} else {
				this.toastr.error(response.Message)
			}
			this.dataLoading = false
		}, (err => {
			this.toastr.error("Error while fetching records")
		}))
	}

	getPackageList(DestinationId: any) {
		const request: RequestModel = {
			request: this.localService.encrypt(JSON.stringify({ DestinationId })).toString()
		};
		this.dataLoading = true;
		this.service.getPackageList(request).subscribe((response: any) => {
			if (response.Message === ConstantData.SuccessMessage) {
				this.PackageList = response.PackageList;
			} else {
				this.toastr.error(response.Message);
			}
			this.dataLoading = false;
		}, () => {
			this.toastr.error("Error while fetching records");
			this.dataLoading = false;
		});
	}

	onSearchChange(value: string) {
		const filterValue = value.toLowerCase();
		this.filteredEnquiryList = this.EnquiryList.filter((item: { EnquiryCode: string; GuestName: string; MobileNo: string; }) =>
			item.EnquiryCode?.toLowerCase().includes(filterValue) ||
			item.GuestName?.toLowerCase().includes(filterValue) ||
			item.MobileNo?.toLowerCase().includes(filterValue)
		);
	}

	onEnquirySelect(selectedItem: any) {
		// handle selected enquiry object
		console.log("Selected Enquiry:", selectedItem);

		this.Booking = selectedItem; // assign the selected item to Booking

		if (this.lblEnquiryCode) {
			this.lblEnquiryCode.nativeElement.innerText = selectedItem.EnquiryCode;
		}
		if (this.lblFlightOption) {
			// const flightText = this.AllFlightOptionList[selectedItem.FlightOption];
			this.lblFlightOption.nativeElement.innerText = selectedItem.FlightOption === 1 ? "With Flight" :
				selectedItem.FlightOption === 2 ? "Without Flight" : "N/A";
		}
		this.Booking.BookingDate = selectedItem.CreatedOn;
		this.Guest = selectedItem; // assign the selected item to Guest
		this.calculateTotalAmount();
		this.setGuestName();
	}


	clearSearch() {
		this.Booking.SearchEnquiry = '';
		this.filteredEnquiryList = [];
		this.getEnquiryListall();
		this.SelectedGuestDetailList = [];
		this.resetForm();
		this.Guest = {};

	}


	destinationSearchText: string = '';
	// DestinationList: any[] = [];
	filteredDestinationList: any[] = [];



	onDestinationSearchChange(value: string) {
		this.filteredDestinationList = this.DestinationList.filter((item: { DestinationName: string; }) =>
			item.DestinationName.toLowerCase().includes(value.toLowerCase())
		);
	}

	onDestinationSelect(selected: string) {
		// Optionally do something with the selected destination
		this.Package.DestinationName = selected;
		const selectedObj = this.DestinationList.find((x: any) => x.DestinationName === selected);
		if (selectedObj) {
			this.Package.DestinationId = selectedObj.DestinationId;
		}
	}

	clearDestination() {
		this.Booking.DestinationName = '';
		this.filteredDestinationList = []; // optional: to reset suggestions
	}


	afterPackageSelected(packageName: string) {
		const selected = this.PackageList.find((p: any) => p.PackageName === packageName);
		if (selected) {
			// Example: Assign other related data if needed
			this.Booking.DestinationId = selected.DestinationId;
			this.Booking.PackageId = selected.PackageId;
		}
	}


	onDateFieldsChange() {
		const arrival = this.Booking.TravelPlanDate ? new Date(this.Booking.TravelPlanDate) : null;
		const departure = this.Booking.DepartureDate ? new Date(this.Booking.DepartureDate) : null;
		const noOfDay = this.Booking.NoOfDay;

		// Case 1: Arrival + NoOfDay → calculate Departure
		if (arrival && noOfDay && !departure) {
			const result = new Date(arrival);
			result.setDate(result.getDate() + parseInt(noOfDay, 10));
			this.Booking.DepartureDate = result;
		}

		// Case 2: Arrival + Departure → calculate NoOfDay
		else if (arrival && departure && !noOfDay) {
			const diffTime = departure.getTime() - arrival.getTime();
			const days = Math.ceil(diffTime / (1000 * 3600 * 24));
			this.Booking.NoOfDay = days;
		}

		// Case 3: Departure + NoOfDay → calculate Arrival
		else if (departure && noOfDay && !arrival) {
			const result = new Date(departure);
			result.setDate(result.getDate() - parseInt(noOfDay, 10));
			this.Booking.ArivalDate = result;
		}
	}


	calculateTotalAmount(): void {
		const rate = Number(this.Booking.AmountQuoted) || 0;
		const persons = Number(this.Booking.NoOfPerson) || 0;
		this.Booking.TotalAmount = rate * persons;
		console.log('Rate:', rate, 'Persons:', persons, 'Total:', this.Booking.TotalAmount);
	}



	onDestinationChange(destinationId: number): void {
		this.Booking.PackageId = null; // Reset package selection
		this.PackageList = this.getPackageList(destinationId); // ✅ Use correct variable
	}



	// Guest management code
	SelectedGuestDetailList: any = [];
	addGuest() {

		this.Guest.GuestId = this.Guest.GuestId;
		this.SelectedGuestDetailList.push(this.Guest);
		// this.clearCurrentPayment();
		this.resetGuest();
	}

	@ViewChild('formGuestDetails') formGuestDetails: NgForm;
	resetGuest() {
		this.Guest = {
			GuestId: 0,
			Title: '',
			GuestName: '',
			Age: null,
			MobileNo: '',
			IDTypeName: '',
			IdNo: '',
			GSTNo: ''
		};

		// If using form template ref (ngForm)
		if (this.formGuestDetails) {
			this.formGuestDetails.resetForm(); // resets validations as well
		}
	}


	RemoveGuest(index: number) {
		this.SelectedGuestDetailList.splice(index, 1);

	}

	// Booking submission code
	saveBooking() {
		this.isSubmitted = true;

		if (
			!this.SelectedGuestDetailList ||
			this.SelectedGuestDetailList.length === 0
		) {
			this.toastr.error(
				'Please add at least one Guest to the list!'
			);
			return;
		}

		// this.Booking.BookingStauts = 1;
		this.Booking.CreatedBy = this.staffLogin.StaffLoginId;
		this.Booking.UpdatedBy = this.staffLogin.StaffLoginId;
		this.Booking.AgentId = this.Booking.AgentId;
		this.Booking.ArivalDate = this.Booking.TravelPlanDate;
		this.Booking.Rate = this.Booking.AmountQuoted;
		this.Guest.IDTypeId = this.Guest.IDTypeId;

		this.Booking.BookingDate = this.loadData.loadDate(this.Booking.BookingDate);
		// this.Booking.ArivalDate = this.loadData.loadDate(this.Booking.ArivalDate);
		this.Booking.ArivalDate = this.loadData.loadDate(this.Booking.ArivalDate);
		this.Booking.DepartureDate = this.loadData.loadDate(this.Booking.DepartureDate);
		this.Guest.DOB = this.loadData.loadDate(this.Guest.DOB);

		const data = {
			GetBooking: this.Booking,
			GetGuests: this.SelectedGuestDetailList,
		};

		const obj: RequestModel = {
			request: this.localService.encrypt(JSON.stringify(data)).toString(),
		};

		this.dataLoading = true;
		this.service.SaveBookingList(obj).subscribe(
			(r1) => {
				const response = r1 as any;

				if (response.Message === ConstantData.SuccessMessage) {
					if (this.Patient.OpdId > 0) {
						this.toastr.success('Booking Updated successfully');
						$('hashtag#staticBackdrop').modal('hide');
					} else {
						this.toastr.success('Booking added successfully');
					}
					this.service.getEnquiryList(response.OpticalBillingId);
					this.SelectedGuestDetailList = [];
					this.resetForm();
				} else {
					this.toastr.error(response.Message);
				}

				this.dataLoading = false;
			},
			(err) => {
				this.toastr.error('Error occurred while submitting data');
				this.dataLoading = false;
			}
		);
	}


	// Function to fetch all enquiries


	getEnquiryListall() {

		const obj: RequestModel = {
			request: this.localService.encrypt(JSON.stringify({})).toString(),
		};
		this.dataLoading = true;
		this.service.getEnquiryList(obj).subscribe({
			next: (r1) => {
				let response = r1 as any;
				if (response.Message == ConstantData.SuccessMessage) {
					this.EnquiryListAll = response.EnquiryList;
					this.filteredEnquiryList = [...this.EnquiryListAll];
					this.EnquiryListAll.map((x1: any) => x1.SearchEnquiry = `${x1.EnquiryCode} - ${x1.PrimaryGuestName} - ${x1.MobileNo}`);
				} else {
					this.toastr.error(response.Message);
				}
				this.dataLoading = false;
			},
			error: (err) => {
				console.error('API error:', err);
				this.toastr.error('Error while fetching records');
				this.dataLoading = false;
			},
		});
	}

	setGuestName() {
		this.Guest.GuestName = this.Guest.PrimaryGuestName;
		this.Guest.MobileNo = this.Guest.MobileNo;
	}
}