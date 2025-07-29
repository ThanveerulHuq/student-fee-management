# Analytics Tracking - BlueMoon SDMS

This document serves as a reference for the privacy-focused Google Analytics tracking implementation in the BlueMoon Student Data Management System.

## Privacy-First Approach

**🔒 No Customer Data Tracking**: This implementation focuses solely on engagement metrics without sending any sensitive customer information such as:
- Student IDs, names, or personal information
- Payment amounts or financial data
- Specific payment methods or transaction details
- Student records or academic information
- User credentials or personal data

## Tracked Events (Engagement Only)

### Authentication Events
- `login` - User successful login (engagement only)
- `logout` - User logout (engagement only)
- `login_failed` - Failed login attempts (engagement only)

### Student Management Events
- `student_created` - New student registration action
- `student_updated` - Student information update action
- `student_deactivated` - Student deactivation action
- `student_reactivated` - Student reactivation action
- `student_enrolled` - Student enrollment action

### Fee Management Events
- `fee_payment` - Fee payment completion (no amounts or methods)
- `receipt_viewed` - Receipt page visits
- `receipt_downloaded` - Receipt download attempts

### Administrative Events
- `fee_structure_created` - New fee structure creation
- `fee_structure_updated` - Fee structure modification
- `user_created` - New system user creation

### Reports & Analytics
- `report_generated` - Report generation with type only
- `outstanding_fees_viewed` - Outstanding fees report access
- `dashboard_visit` - Dashboard page visits

### Navigation & Engagement
- `page_view` - Page visits with section context
- `search` - Search operations (search type only)

### Error Tracking
- `error` - Application errors with type and page context

## Event Parameters (Privacy-Safe)

### Standard Parameters
- `category` - Event category (authentication, student_management, fee_management, etc.)
- `page_title` - Page name for navigation tracking
- `page_section` - Application section
- `search_type` - Type of search performed
- `report_type` - Type of report generated
- `error_type` - Error classification
- `action` - Performance action type

## Data Protection Guarantees

### ✅ What We Track
- User engagement patterns and feature adoption
- Most popular sections and workflows
- Error rates and performance insights
- Feature usage frequency and trends
- User journey flow through the application

### ❌ What We DON'T Track
- Personal identifiable information (PII)
- Financial transaction details
- Student records or academic information
- Search query content
- Specific user credentials or sensitive data

## Privacy & Security Best Practices

1. **🔒 Privacy First**: Never track PII, financial data, or sensitive information
2. **📊 Engagement Focus**: Track user interactions and system usage patterns only
3. **🎯 Business Intelligence**: Focus on feature usage and user journey insights
4. **🔍 Testing**: Verify no sensitive data is sent using GA4 Real-time reports
5. **📝 Documentation**: Keep this file updated with any new engagement events
6. **🏷️ Consistency**: Use consistent naming for events and categories

## Monitoring

Monitor analytics data in:
- Google Analytics 4 Dashboard
- Real-time reports for testing
- Conversion events for key business metrics
- Custom reports for specific insights

## Environment Configuration

Ensure `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` is set in your environment:

```env
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

## Compliance

This analytics implementation is designed to comply with:
- GDPR (General Data Protection Regulation)
- Student privacy laws and regulations
- Educational data protection standards
- Local data protection requirements

## Future Considerations

1. Complete remaining student management event tracking
2. Add comprehensive administrative action tracking
3. Implement performance monitoring
4. Add custom dimensions for better segmentation
5. Create GA4 custom reports for school-specific metrics

---

*Last Updated: January 2025*