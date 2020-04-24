export class Task {
  constructor(
    public answer: object,
    public category: string,
    public evaluate: string,
    public id: number,
    public mapFeatures: object,
    public name: string,
    public question: object,
    public settings: object,
    public type: string
  ) { }
}
