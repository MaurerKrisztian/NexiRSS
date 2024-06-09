import { TimeMeasurementService } from './time-mesurment.service';

const timeMeasurementService = new TimeMeasurementService();

export function MeasureMethod() {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    timeMeasurementService.measureMethod(target, propertyKey, descriptor);
  };
}

export function MeasureMethodAsync() {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    timeMeasurementService.measureMethodAsync(target, propertyKey, descriptor);
  };
}
