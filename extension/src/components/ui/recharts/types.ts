export type RechartDatum = {
    name: string;
    value: number;
}

export type RechartProps = {
    colors: string[];
    data: RechartDatum[];
    className?: string;
}
