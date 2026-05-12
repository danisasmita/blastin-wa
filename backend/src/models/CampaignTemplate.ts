import {
  Table,
  Column,
  DataType,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  Default,
  AllowNull,
  HasMany
} from "sequelize-typescript";
import Campaign from "./Campaign";

@Table
class CampaignTemplate extends Model<CampaignTemplate> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  name: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  body: string;

  @Default(true)
  @Column
  isActive: boolean;

  @HasMany(() => Campaign)
  campaigns: Campaign[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default CampaignTemplate;
