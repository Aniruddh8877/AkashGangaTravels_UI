import { Component, ViewChild } from '@angular/core';
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
  OpticalList: any = [];
  ChargeList: any;
  Package: any;
  Booking: any = [];
  Guest: any = [];
  DesignationList: any;
  selectedEnquiry: any = null;


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
    this.getEnquiryListall(this.Patient.PatientId);
    // this.tempData = this.service.getSelectedOpticalData();

    this.staffLogin = this.localService.getEmployeeDetail();
    this.validiateMenu();
    this.resetForm();
    this.getOpticalList();
    this.getPackageList(this.DestinationList?.[0]?.DestinationId);
    this.getDestinationList();
    this.getHotelCategoryList();
    this.getIDTypeList();
    this.getAgentList();
    this.route.queryParams.subscribe((params: any) => {
      this.Patient.PatientId = params.id;
      this.redUrl = params.redUrl;
      if (this.Patient.PatientId > 0) {
        this.getEnquiryList(this.Patient.PatientId);
      }
    });


    this.route.queryParams.subscribe((params) => {
      const OpticalBillingId = params['id'];
      const redUrl = params['redUrl'];

      // const data = this.service.get();
      // if (data && data.GetOpticalBilling.OpticalBillingId == OpticalBillingId) {
      //   this.Patient = {
      //     ...data.GetOpticalBilling,
      //     ...data.GetPaymentCollection,
      //   };
      //   this.SelectedGuestDetailList = data.GetOpticalsDetails;
      //   this.SelectedPaymentCollectionList = data.GetPaymentDetails;

      // } else {
      //   // Optional: fallback to fetch data again using surgeryId
      // }

    });
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


  @ViewChild('formPatientDetails') formPatientDetails: NgForm;
  resetForm() {
    this.Patient = {};
    // this.Patient.OpdDate = this.loadData.newloadDateYMD(new Date());

    if (this.formPatientDetails) {
      this.formPatientDetails.control.markAsPristine();
      this.formPatientDetails.control.markAsUntouched();
    }
    this.isSubmitted = false;
  }

  searchText: string = '';
  // EnquiryList: any[] = [];
  // filteredEnquiryList: any[] = [];

  getEnquiryList(destinationId: any) {
    const request: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString()
    };

    this.dataLoading = true;
    this.service.getEnquiryList(request).subscribe((response: any) => {
      if (response.Message === ConstantData.SuccessMessage) {
        this.EnquiryList = response.EnquiryList;
        this.filteredEnquiryList = this.EnquiryList; // initial copy
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
    this.filteredEnquiryList = this.EnquiryList.filter((item: { EnquiryNo: string; GuestName: string; MobileNo: string; }) =>
      item.EnquiryNo?.toLowerCase().includes(filterValue) ||
      item.GuestName?.toLowerCase().includes(filterValue) ||
      item.MobileNo?.toLowerCase().includes(filterValue)
    );
  }

  onEnquirySelect(selectedItem: any) {
    // handle selected enquiry object
    console.log("Selected Enquiry:", selectedItem);
    this.Booking = selectedItem; // assign the selected item to Booking
    this.Booking.BookingDate = selectedItem.CreatedOn;
    this.Guest = selectedItem; // assign the selected item to Guest
    // you can assign values here, e.g.
    // this.selectedEnquiryId = selectedItem.EnquiryId;
    this.calculateTotalAmount();
  }

  destinationSearchText: string = '';
  // DestinationList: any[] = [];
  filteredDestinationList: any[] = [];

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

  getDesignationList() {
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString()
    }
    this.dataLoading = true
    this.service.getDesignationList(obj).subscribe(r1 => {
      let response = r1 as any
      if (response.Message == ConstantData.SuccessMessage) {
        this.DesignationList = response.DesignationList;


      } else {
        this.toastr.error(response.Message)
      }
      this.dataLoading = false
    }, (err => {
      this.toastr.error("Error while fetching records")
    }))
  }
  onDateFieldsChange() {
    const arrival = this.Booking.ArrivalDate ? new Date(this.Booking.ArrivalDate) : null;
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
      this.Booking.ArrivalDate = result;
    }
  }


  calculateTotalAmount(): void {
    const rate = Number(this.Booking.AmountQuoted) || 0;
    const persons = Number(this.Booking.NoOfPerson) || 0;
    this.Booking.TotalAmount = rate * persons;
    console.log('Rate:', rate, 'Persons:', persons, 'Total:', this.Booking.TotalAmount);
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


  getOpticalList() {
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString(),
    };
    this.dataLoading = true;
    this.service.getEnquiryList(obj).subscribe(
      (r1) => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.OpticalList = response.OpticalList;
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

  afterTransportSupplierSelected(event: any) {
    this.Payment.OpticalId = event.option.id;
    this.Payment.OpticalName = event.option.value;
    var Transport = this.ChargeList.find(
      (x: any) => x.OptocalId == this.Payment.OptocalId
    );
    this.Payment.OpticalName = Transport.OpticalName;
    this.Payment.OpticalItemRate = Transport.OpticalPrice;
    this.Payment.Description = Transport.Description;
    this.Payment.Quantity = 1;
    this.Payment.OpticalId = Transport.OpticalId;
  }

  filterTransportSupplierList(value: any) {
    if (value) {
      const filterValue = value.toLowerCase();
      this.ChargeList = this.OpticalList.filter((option: any) =>
        option.OpticalName.toLowerCase().includes(filterValue)
      );
    } else {
      this.ChargeList = this.OpticalList;
    }
  }
  clearTransportSupplier() {
    this.ChargeList = this.OpticalList;
    this.Payment.OpticalId = null;
    this.Payment = {};
  }


  recalculateTotals() {
    let totalAmount = 0;
    let totalDiscount = 0;
    let totalLineTotal = 0;

    this.SelectedGuestDetailList.forEach((item: { Amount: any; Discount: any; LineTotal: any; }) => {
      totalAmount += item.Amount || 0;
      totalDiscount += item.Discount || 0;
      totalLineTotal += item.LineTotal || 0;
    });

    this.Patient.TotalAmount = totalAmount;
    this.Patient.DiscountAmount = totalDiscount;
    this.Patient.PayableAmount = totalLineTotal;
    this.currentPayment.PaidAmount = totalLineTotal;
  }


  clearCurrentPayment() {
    this.Payment = {
      OpticalName: '',
      Rate: 0,
      Quantity: 1,
      Amount: 0,
      Discount: 0,
      LineTotal: 0
    };
  }

  onDestinationChange(destinationId: number): void {
    this.Booking.PackageId = null; // Reset package selection
    this.PackageList = this.getPackageList(destinationId); // ✅ Use correct variable
  }


  SelectedGuestDetailList: any = [];
  addGuest() {

    this.Guest.GuestId = this.Guest.GuestId;
    this.SelectedGuestDetailList.push(this.Guest);
    this.clearCurrentPayment();
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
    this.CalculateTotalAmount();
  }

  resetHotelPayment() {
    this.Payment = {};
    this.isSubmitted = false;
  }

  CalculateTotalAmount() {
    let TotalAmount = 0;

    for (let i = 0; i < this.SelectedGuestDetailList.length; i++) {
      const paymentDetail = this.SelectedGuestDetailList[i];
      TotalAmount += parseFloat(paymentDetail.Amount) || 0;
    }

    this.Patient.TotalAmount = TotalAmount;
    this.Patient.DiscountAmount = 0;
    this.Patient.PayableAmount = TotalAmount;
    this.Patient.PaidAmount = 0;
    this.currentPayment.PaidAmount = TotalAmount;
  }

  updatePaymentFields() {
    this.Patient.PayableAmount =
      this.Patient.TotalAmount - this.Patient.DiscountAmount;
    this.Patient.PaidAmount =
      this.Patient.TotalAmount - this.Patient.DiscountAmount;
    this.currentPayment.PaidAmount =
      this.Patient.TotalAmount - this.Patient.DiscountAmount;
  }

  ChangeDuesAmount() {
    this.Patient.DueAmount =
      this.Patient.PayableAmount - this.Patient.PaidAmount;
  }

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

    this.Booking.BookingStauts = 1;
    this.Booking.CreatedBy = this.staffLogin.StaffLoginId;
    this.Booking.UpdatedBy = this.staffLogin.StaffLoginId;
    this.Booking.AgentId = 1;
    this.Booking.TravelDate = this.Booking.ArrivalDate;
    this.Booking.Rate = this.Booking.AmountQuoted;
    // this.Guest.GuestName = this.Booking.PrimaryGuestName;
    // this.Guest.MobileNo = "9869896";
    // this.Guest.Email = "this.Booking.Email";
    // this.Guest.IDTypeId = 1;
    // this.Guest.IDNumber = "this.Booking.IDNumber";
    // this.Guest.GSTNo = "this.Booking.GSTNo";
    // this.Guest.DOB = "2025-07-16 00:00:00.000";


    if (this.tempData != undefined) {
      this.Booking.PaymentCollectionId =
        this.tempData.GetPaymentCollection.PaymentCollectionId;
    }

    const data = {
      GetBooking: this.Booking,
      GetGuests: this.SelectedGuestDetailList,
    };

    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(data)).toString(),
    };

    this.dataLoading = true;
    this.service.getBookingList(obj).subscribe(
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
          this.SelectedPaymentCollectionList = [];
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

  SelectedPaymentCollectionList: any[] = [];





  getEnquiryListall(PatientId: number) {
    var data = {
      PatientID: PatientId,
    };
    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(data)).toString(),
    };
    this.dataLoading = true;

    this.service.getEnquiryList(obj).subscribe({
      next: (r1) => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.EnquiryListAll = response.EnquiryList;
          this.filteredEnquiryList = [...this.EnquiryListAll];
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

  filterEnquiryList(value: string) {
    const filterValue = value?.toLowerCase() || '';

    this.filteredEnquiryList = this.EnquiryListAll.filter(
      (option: any) =>
        option.PatientName?.toLowerCase().includes(filterValue) ||
        option.UHID?.toLowerCase().includes(filterValue) ||
        option.ContactNo?.toLowerCase().includes(filterValue)
    );
  }

  afterPatientSelected(event: any) {
    const selectedName = event.option.value;

    const selected = this.EnquiryListAll.find(
      (x: any) => x.PatientName === selectedName
    );

    if (selected) {
      this.Patient = { ...selected }; // assign full patient object
      this.getEnquiryList(this.Patient.PatientID); // optional
    }
    if (selected) {
      this.Payment.OpticalItemRate = selected.Rate || 0;  // get the rate from your selected option
      this.Payment.Quantity = 1;
      this.onRateChange();  // calculate Amount and LineTotal
    }
  }

  clearPatient() {
    this.ChargeList = this.EnquiryListAll;
    // this.Patient.PackageCollectionId = null;
    this.Patient.PatientName = '';
  }




  // my code 
  onRateChange() {
    if (this.Payment.Quantity && this.Payment.OpticalItemRate) {
      this.Payment.Amount = this.Payment.OpticalItemRate * this.Payment.Quantity;
      this.updateLineTotal();
    }
  }

  onQuantityChange() {
    if (this.Payment.OpticalItemRate && this.Payment.Quantity) {
      this.Payment.Amount = this.Payment.OpticalItemRate * this.Payment.Quantity;
      this.updateLineTotal();
    }
  }

  onDiscountChange() {
    this.updateLineTotal();
  }

  updateLineTotal() {
    this.Payment.LineTotal =
      (this.Payment.Amount || 0) - (this.Payment.Discount || 0);
  }








}
