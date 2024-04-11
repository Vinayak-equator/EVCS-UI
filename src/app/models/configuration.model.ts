export class ConfigurationModel {
    configurationKey:configurationKey[];    
}

export class configurationKey{
    key: string;
    value: string;
    readonly: string;
}