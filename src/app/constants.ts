export class AppConstants {
  public static numberPattern = '^[0-9]*$';
  public static stringPattern = '[a-zA-Z]+';
  public static fullNamePattern = "([a-zA-Z',.-]+( [a-zA-Z',.-]+)*){2,30}";
  public static addressPattern = '^[#.0-9a-zA-Zs /,-]+$';
  public static multiLanguagePath = '/assets/i18n/';
  public static UGGAdminRoleName = 'UGG_Admin';
  public static dateFormatColumnStringArray = ['startTime', 'stopTime'];

  public static NavigateDashboard = '/dashboard';
  public static NavigateTenants = '/tenants';
  public static TenantCreationPage = 'tenant-creation';
  public static TenantDetailPage = 'tenant-edit/';
  public static TransactionDetailPage = 'transaction-edit/';
  public static TransactionListPage = 'transaction-list/';
  public static FilterHeader_Name = 'name';
  public static FilterHeader_Location = 'location';
  public static Pending = 'Pending';
  public static Occupied = 'Occupied';
  public static Faulted = 'Faulted';
  public static Available = 'Available';
  public static Online = 'Online';
  public static Offline = 'Offline';
  public static NotAvailable = 'Not Available';
  public static FillMandatoryFields = 'There is no valid data.';
  public static NoTenantChanges =
    'There is no changes to update organization details or invalid data.';
  public static NoChargerChanges =
    'There is no changes to update charger details or invalid data.';
  public static NoSiteChanges =
    'There is no changes to update site details or invalid data.';
  public static TenantAdminRoleName = 'Tenant_Admin';
  public static TenantCreated = 'Organization created successfully.';
  public static TenantUpdated = 'Organization updated successfully.';
  public static ChargePointCreatedMsg = 'Charger created successfully.';
  public static SiteCreatedMsg = 'Site created successfully.';
  public static ChargePointUpdatedMsg = 'Charger updated successfully.';
  public static ConfigureDataUpdated = 'Config data updated successfully.';
  public static SiteUpdated = 'Site updated successfully.';
  public static InOperative = 'Connector is InOperative.';
  public static Operative = 'Connector is Operative.';
  public static Diagnostics = 'Diagnostics is Diagnostics.';
  public static Trigger = 'No response for trigger.';
  public static Unlock = 'No response for Unlock.';
  public static Start = 'No response for Start.';
  public static Stop = 'No response for Stop.';
  public static Reset = 'No response for Reset.';
  public static UpdateFirmware = 'No response for UpdateFirmware.';
  public static UpdateConfigure = 'No response for update configure.';
  public static TransactionDetail = 'No Transaction for transactionLogId.';
  public static SiteEditUrl = 'site-edit/';
  public static ChargerEditUrl = 'charger-edit/';
  public static SiteCreationUrl = 'site-creation/';
  public static SiteDashboardUrl = 'site-dashboard/';
  public static ChargerCreationUrl = 'charger-creation/';
  public static EmptyUrl = '';
  public static SessionExpired = 'Session Expired';
  public static SignalRDisconnected = 'SignalR push notification disconnected';
  public static UserNotActive = 'User not active';
  public static Success = 'Success';
  public static Warning = 'Warning';
  public static Error = 'Error';
  public static InternalServerError = 'Internal Server Error';
  public static SignUpInvite = 'Signup message';
  public static NoTransactionList =
    'No transactionList for selected organization, site and transactionDate';
  public static RoleUpdate = 'Roles Updated successfully.';
  public static imgUpload = 'Image Uploaded successfully.';
  public static smartCharging = 'Smart Charging Request Created successfully.';

  public static DriverActivityReportTransactionDetailUrl = 'driveractivityreport-transactiondetail/';

  // public static APIUrlDashboardCard = 'api/v1/Dashboard/Tenant';
  public static APIUrlSiteMap = 'api/v1/Dashboard/SiteMap/';
  public static APIUrlDashboardCard = 'api/v1/Dashboard/Sites/';
  public static APIUrlDashboardTenantList = 'api/v1/tenants/';
  public static APIUrlChargeCreate = 'api/v1/chargepoint/create/';
  public static APIUrlChargeUpdate = 'api/v1/chargepoint/update/';
  public static APIUrlChargePointsById = 'api/v1/chargepoints/';
  public static APIUrlChargeConfigure = 'api/v1/chargepoint/configuration/';
  public static APIUrlConnectorStart = 'api/v1/chargepoint/start/';
  public static APIUrlConnectorStop = 'api/v1/chargepoint/stop/';
  public static APIUrlConnectorReset = 'api/v1/chargepoint/reset/';
  public static APIUrlConnectorUnlock = 'api/v1/chargepoint/unlock/';
  public static APIUrlConnectorInOperative = 'api/v1/chargepoint/inoperative/';
  public static APIUrlConnectorOperative = 'api/v1/chargepoint/operative/';
  public static APIUrlConnectorDiagnostics = 'api/v1/chargepoint/diagnostics/';
  public static APIUrlUpdatefirmware = 'api/v1/chargepoint/updatefirmware/';
  public static APIUrlClear = 'api/v1/chargepoint/clear/';
  public static APIUrlTrigger = 'api/v1/chargepoint/trigger/';
  public static APIUrlGetNumberOfConnectors = 'api/v1/chargepoint/';
  public static APIUrlOnboarding = 'api/v1/chargepoint/Onboarding/';
  public static APIUrlUpdateConfig = 'api/v1/chargepoint/updateconfiguration/';
  public static APIUrlMessages = 'api/v1/messages/List/';
  public static APIUrlSiteCreationUrl = 'api/v1/site/create/';
  public static APIUrlSiteListUrl = 'api/v1/sitelist/';
  public static APIUrlSiteUpdateUrl = 'api/v1/site/update/';
  public static APIUrlSiteDashboardtUrl = 'api/v1/Dashboard/Sites/';
  public static APIUrlTenantNameListtUrl = 'api/v1/tenantList';
  public static APIUrlUserValidatetUrl = 'api/v1/user/validate/';
  public static APIUrlTenantTransfer = 'api/v1/site/TransferSite/';
  public static APIUrlConnectorDetails = 'api/v1/Dashboard/ConnectorDetails';
  public static APIUrlOfflineConnectorDetails =
    // 'api/v1/Dashboard/OfflineConnectorDetails';
    'api/v1/Dashboard/ConnectorDetails';
  public static APIUrlGetSiteOwnerCardCounts = 'api/v1/Dashboard/revenue/';
  public static APIUrlTenantUpdate = 'api/v1/tenant/update/';
  public static APIUrlTenantCreate = 'api/v1/tenant/register/';
  public static APIUrlGetTenantById = 'api/v1/tenant/';
  public static APIUrlGetChargePointById = 'api/v1/chargePoint/';
  public static APIUrlGetSites = 'api/v1/sites/';
  public static APIUrlGetSiteById = 'api/v1/site/';
  public static APIUrlSignUpInvite = 'api/v1/tenant/signupinvite/';
  public static APIUrlTransactionList = 'api/v1/transactions/';
  public static APIUrlTransactionById = 'api/v1/transaction/';
  public static APIUrlTransactionByDate =
    'api/v1/transactions/Gettransactionbydate';

  public static APIUrlChargerImgUpload = 'api/v1/chargerimgupload';
  public static APIUrlPromocodeList = 'api/v1/promocodes/';
  public static APIUrlDeletedPromocodeList = 'api/v1/deletedpromocode/';
  public static APIUrlLogManagement = 'api/v1/messages/LogList';
  public static APIUrlValidatePromocode = 'api/v1/validatepromocode/';
  public static APIUrlPromocodeAdd = 'api/v1/promocode/add';
  public static APIUrlPromocodeUpdate = 'api/v1/promocode/update/';
  public static APIUrlPromocodeDelete = 'api/v1/promocode/delete/';
  public static APIUrlTenantToSiteList = 'api/v1/promocodes/getSiteByTenant';
  public static APIUrlSiteToChargePointList = 'api/v1/promocode/getChargePointBySite';
  public static APIUrlGetAllPromoCodeList = 'api/v1/allpromocodeslist';
  public static APIUrlSmartCharging = 'api/v1/smartCharging';
  public static APIUrlGetAllSmartCharging = 'api/v1/getAllSmartCharging';

  public static APIUrlLogin = 'api/v1/user/userLogin';
  public static APIUrlForgotPassword = 'api/v1/user/forgotpassword';
  public static APIUrlGetAllRoles = 'api/v1/user/roles';
  public static APIUrlUpdateRole = 'api/v1/UserRole/Update/';
  public static APIUrlGetAllUsers = 'api/v1/user/GetAllUsers/';
  public static APIUrlCreateUser = 'api/v1/user/add/';
  public static APIUrlUpdateUser = 'api/v1/user/update/';
  public static APIUrlDeleteUser = 'api/v1/user/Delete/';
  public static APIUrlCheckUserExist = 'api/v1/user/CheckUserExist';

  public static APIUrlGetAllDeleteRequests =
    'api/v1/DeleteRequest/GetAllDeleteRequests';
  public static APIUrlCreateDeleteRequest = 'api/v1/DeleteRequest/Create';
  public static APIUrlUpdateDeleteRequest = 'api/v1/DeleteRequest/Update';
  public static APIUrlDeleteChargePoint =
    'api/v1/chargepoint/DeletChargerPoint/';
  public static APIUrlDeleteSite = 'api/v1/site/Delete/';
  public static APIUrlDeleteTenant = 'api/v1/tenant/Delete/';
  public static APIUrlGenerateReport = 'api/v1/userstatement/create';
  public static APIUrlGetAllTickets = 'api/v1/Support/GetSupportTicket';
  public static APIUrlCreateTicket = 'api/v1/Support/Create';
  public static APIUrlUpdateTicket = 'api/v1/Support/Update';
  public static APIUrlDeleteTicket = 'api/v1/Support/Delete/';
  public static APIUrlCreateReply = 'api/v1/Support/CreateSupportReply/';
  public static APIUrlGetUserStatements = 'api/v1/userstatement/';
  public static APIUrlGetSettings = 'api/v1/Settings/GetAll';
  public static APIUrlUpdateSettings = 'api/v1/Settings/Update/';
  public static APIUrlGetInProgressTransactionDetail = 'api/v1/transactions/GetInProgressTransactionDetail';
  public static APIUrlGetGlobalSettings = 'api/v1/globalsetting/Getsetttings';
  public static APIUrlAddGlobalSettings = 'api/v1/globalsetting/add';
  public static APIUrlUpdateGlobalSettings = 'api/v1/globalsetting/update/';

  public static APIUrlGetUserProfile = 'api/v1/user/GetUserDetails';
  public static APIUrlUpdateUserProfile = 'api/v1/user/UpdateUserDetails';

  public static APIUrlGetStatistics =
    'api/v1/transactions/GetTransactionsDetailsbyDate/';

  public static APIUrlGetRegisteredUsers = 'api/v1/Dashboard/RegisteredUsers';
  public static APIUrlGetChargerData = 'api/v1/Dashboard/ChargersData/';
  public static APIUrlGetOnlineChargers = 'api/v1/chargepoint/GetChargers/';
  public static APIUrlGetOfflineChargers =
    'api/v1/chargepoint/GetOfflineChargers/';
  public static APIUrlGetUnavailableChargers = 'api/v1/Dashboard/Connectors';
  public static APIUrlGetGraphData = 'api/v1/transactions/GetRevenueandTrafic/';

  public static APIUrlGetDriverRegistration = 'api/v1/driverregistration';
  public static APIUrlGetNonRegisteredDriver = 'api/v1/nonregistereddriver';
  public static APIUrlGetDriverActivity = 'api/v1/driveractivity';
  public static APIUrlGetDriverActivityChartCount = 'api/v1/driveractivitychart';
  public static APIUrlGetDriverActivityReportTransactionDetail = 'api/v1/driveractivityreporttransactiondetails';
  public static APIUrlGetFinancialRevenue =
    'api/v1/transactions/GetFinancialRevenueReport';
  public static APIUrlGetPromoCodeDetails =
    'api/v1/promocode/GetPromocodeReportDetails';
  public static APIUrlGetChargePointUptime =
    'api/v1/chargepoint/GetUpTimeChargerReport/';
  public static APIUrlGetChargePointUtilizationReport = 'api/v1/chargepointutilization';
  public static APIUrlGetSiteUtilizationReport = 'api/v1/siteactivity';
  public static APIUrlGetReservationReport = 'api/v1/chargepointreservation';

  public static APIUrlDefaultTenantNameListtUrl =
    'api/v1/tenants/GetDefaultTenants/true';
  public static APIUrlGetAllSites = 'api/v1/sites';
  public static APIUrlTransferChargePoint =
    'api/v1/chargepoint/TransferChargepoint/';
  public static APIUrlDeactivateChargePoint =
    'api/v1/chargepoint/DeactivateCharger/';
  public static APIUrlGetAllInactiveChargePoints =
    'api/v1/chargepoint/GetDefaultInAciveChargers';
  public static APIUrlGetAllTransferRequests =
    'api/v1/ChargePointTransferRequest/GetAllChargepointTransferRequests';
  public static APIUrlCreateTransferRequest =
    'api/v1/ChargePointTransferRequest/Create';
  public static APIUrlUpdateTransferRequest =
    'api/v1/ChargePointTransferRequest/Update';
  public static APIUrlGetTransferingChargePoints =
    'api/v1/chargepoint/GetTransferingChargePoints/';


    public static GetMaintenance =
    'api/v1/Dashboard/Maintenance';



  // Route Value ID Names
  public static TenantID = 'TenantID';
  public static SiteID = 'SiteID';
  public static ChargePointID = 'ChargePointID';
  public static ConnectorID = 'ConnectorID';
  public static TransactionID = 'TranscationID';
  public static TransactionLogID = 'TranscationLogID';
  public static siteName = 'siteName';

  //Driver Activity Report Transaction Details
  public static email = 'email';
  public static reportType = 'reportType';
  public static startdate = 'startdate';
  public static enddate = 'enddate'

  // Push Notification details
  public static pushHostEndpoint = '/api/negotiate?hubname=evchargepointhub';

  /** Site Creation Default Charging Rates */
  public static DefaultLevel2Rate: number = 0.067;
  public static DefaultDcFastRate: number = 0.3;
}
export class TenantConstants {
  public static NewTenantTitle = 'Organization Registration Page';
  public static TenantDetail = 'Organization Detail';

  public static Name = 'Name is required.';
  public static Company = 'Company is required.';
  public static Email = 'Email is required.';
  public static Phone = 'Phone is required.';
  public static City = 'City is required.';
  public static State = 'State is required.';
  public static Street = 'Address is required.';
  public static ZipCode = 'ZipCode is required.';

  public static ZipCodeLength = 'The minimum length of ZipCode is 5.';
  public static PhoneLength = 'The minimum length of Phone is 10.';
  public static CityLength = 'The minimum length of City is 2.';
  public static EmailInvalid = 'Email address is not valid.';
  public static StateLength = 'The minimum length of State is 2.';
  public static CompanyLength = 'The minimum length of Company is 3.';
  public static StreetLength = 'The minimum length of Address is 15.';
  public static NameLength = 'The minimum length of Name is 3.';
}
