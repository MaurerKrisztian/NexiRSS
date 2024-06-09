export class TimeMeasurementService {
  measureMethod(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): void {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const start = performance.now();
      const result = originalMethod.apply(this, args);
      const end = performance.now();
      const duration = end - start;

      console.log(`${propertyKey} executed in ${duration}ms`);
      return result;
    };
  }

  measureMethodAsync(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): void {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const start = performance.now();
      const result = await originalMethod.apply(this, args);
      const end = performance.now();
      const duration = end - start;

      console.log(
        `${propertyKey} executed in ${duration}ms (${duration / 1000} s)`,
      );
      return result;
    };
  }
}
