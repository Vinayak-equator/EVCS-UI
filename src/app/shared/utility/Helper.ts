import * as moment from 'moment';

export default class Helper {

    static ConvertToLocalTime(utcTime: string) {
        if (utcTime === undefined || utcTime === null) { return ''; }
        const offset = moment().utcOffset();
        const localDateTime = moment.utc(utcTime).utcOffset(offset).format('MM-DD-YYYY hh:mm A');
        return localDateTime;
    }

    //Please provide momemt format  Eg: (DD/MM/YYYY HH:mm:ss)
    //Refer here  - https://momentjscom.readthedocs.io/en/latest/moment/04-displaying/01-format/
    static getLocalDate(utcDate: any, momentFormat: string, defaultValue: string = '--'): string {
        utcDate = this.validateDate(utcDate);
        if (Helper.hasObject(utcDate)) {
            try {
                let validUTC = moment.utc(utcDate).toDate();
                return moment(validUTC)
                    .local()
                    .format(momentFormat);
            } catch (e) {
                return defaultValue;
            }
        } else {
            return defaultValue;
        }
    }

    static validateDate(date: Date): any {
        try {
            if (Helper.isNullOrEmpty(date)) return null;
            let thisDate = moment(date);
            if (thisDate.isValid()) {
                return date;
            }
            return null;
        } catch (e) {
            return null;
        }
    }

    static isNullOrWhitespace(value: any): boolean {
        if (value == undefined || value == null || value == '') {
            return true;
        }
        return typeof value === 'string' && value.toString().trim().length === 0;
    }

    static hasAny(value: any): boolean {
        return !Helper.isNullOrEmpty(value);
    }

    static getFirstOrDefault(array: any[], defaultValue: any = null): any {
        return Helper.hasElements(array) ? array[0] : defaultValue;
    }

    static isFileTypeNotSuported(fileName: string, supportedFileTypes: string[]) {
        return !Helper.isFileTypeSuported(fileName, supportedFileTypes);
    }

    static isFileTypeSuported(fileName: string, supportedFileTypes: string[]) {
        let oRET: boolean = false;
        if (!Helper.isNullOrEmpty(oRET) && fileName.includes('.') && Helper.hasElements(supportedFileTypes)) {
            fileName = fileName.toLowerCase();
            supportedFileTypes.forEach((fileType) => {
                fileType = fileType.toLowerCase().trim();
                if (!oRET && fileName.endsWith(fileType)) {
                    return (oRET = true);
                }
            });
        }
        return oRET;
    }

    static isInvalidDate(dateString: any): boolean {
        return dateString.toString() === 'Invalid Date';
    }

    static getDate(dateValue: any, momentFormat: string) {
        return moment(dateValue, momentFormat).toDate();
    }

    static getFormattedDate(dateValue: string): any {
        let format: string = 'MM-DD-YYYY';
        if (Helper.isNullOrEmpty(dateValue) || Helper.isInvalidDate(dateValue) || dateValue == '-- --') return null;
        let formattedDate = moment(dateValue).format(format);
        return formattedDate;
    }

    static getFormattedDateTime(dateValue: string): any {
        let format: string = 'MM-DD-YYYY HH:mm:ss';
        if (Helper.isNullOrEmpty(dateValue) || Helper.isInvalidDate(dateValue) || dateValue == '-- --') return null;
        let formattedDate = moment(dateValue).format(format);
        return formattedDate;
    }

    static getFormattedDateFromDate(dateValue: Date | string): any {
        let format: string = 'MM-DD-YYYY';
        if (Helper.isNullOrEmpty(dateValue) || Helper.isInvalidDate(dateValue)) return null;
        return new Date(moment(dateValue).format(format));
    }

    static getMomemtUtcDateOnly(dateValue: string, format: string = 'YYYY-MM-DDTHH:mm:ss.SSS[Z]'): string {
        if (Helper.isNullOrEmpty(dateValue) || Helper.isInvalidDate(dateValue)) return '';
        const momentString = moment.utc(dateValue).format(format);
        return Helper.removeTime(momentString);
    }
    static convertUTCDateToLocalDate(date: any) {
        var newDate = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);

        var offset = date.getTimezoneOffset() / 60;
        var hours = date.getHours();

        newDate.setHours(hours - offset);

        return newDate;
    }

    static removeTime(utcDateTime: any) {
        if (Helper.isNullOrEmpty(utcDateTime) || Helper.isInvalidDate(utcDateTime)) return '';
        if (typeof utcDateTime === 'string' && utcDateTime.includes('T') && utcDateTime.endsWith('Z')) {
            // clear the time values if any
            //return utcDateTime.substring(0, utcDateTime.indexOf('T')) + 'T00:00:00.000Z';
            return utcDateTime?.replace('T', ' ').slice(0, -5);
            // return utcDateTime.substring(0, utcDateTime.indexOf('T'));
        } else {
            let datevalue = moment.utc(utcDateTime).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
            if (datevalue.includes('T') && datevalue.endsWith('Z'))
                // return datevalue.substring(0, datevalue.indexOf('T')) + 'T00:00:00.000Z';
                return datevalue.substring(0, datevalue.indexOf('T'));
            else return utcDateTime;
        }
    }

    static isNullOrEmpty(value: any): boolean {
        if (typeof value === 'string') {
            return value === undefined || value === null || value.trim() === '' || value.trim().length === 0;
        }

        return value == undefined || value == null || value.length === 0;
    }

    /**
     * @deprecated use !isNullOrEmpty instead
     **/
    static hasElements(value: any): boolean {
        return value !== undefined && value !== null && value.length > 0;
    }

    static hasObject(value: any): boolean {
        return value !== undefined && value !== null;
    }

    static isNumberGreaterThanZero(value: any): boolean {
		return !this.isNumberNotGreaterThanZero(value);
	}

	static isNumberNotGreaterThanZero(value: any): boolean {
		return (
			value === undefined ||
			value === null ||
			value === 0 ||
			(typeof value === 'string' && this.isNullOrEmpty(value))
		);
	}

    static isValidEmail(input: string): boolean {
		const regexp = new RegExp(
			/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		);
		return regexp.test(input);
	}

    static encodeRole(role: string): string {
        const dt = Date.now();
        localStorage.setItem('today', dt.toString());
        return btoa(dt + ':' + role + ':' + dt)
    }

    static decodeRole(code: string): string {
        const data = atob(code);
        return data.split(':')[1];
    }

}