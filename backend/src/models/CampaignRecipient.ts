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
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import Campaign from "./Campaign";
import Contact from "./Contact";

@Table
class CampaignRecipient extends Model<CampaignRecipient> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Default("pending")
  @Column(DataType.STRING)
  status: string;

  @Column(DataType.TEXT)
  personalizedBody: string;

  @Column(DataType.TEXT)
  lastError: string;

  @Column(DataType.DATE)
  sentAt: Date;

  @ForeignKey(() => Campaign)
  @AllowNull(false)
  @Column
  campaignId: number;

  @BelongsTo(() => Campaign)
  campaign: Campaign;

  @ForeignKey(() => Contact)
  @AllowNull(false)
  @Column
  contactId: number;

  @BelongsTo(() => Contact)
  contact: Contact;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default CampaignRecipient;
