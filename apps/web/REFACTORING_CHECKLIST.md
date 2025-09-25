# 🛡️ TradingSidebar Refactoring Safety Checklist

## 📋 **Current Feature Inventory**

### **Mobile Features (isMobile = true)**
- [ ] **Container**: Fixed bottom positioning (430px width, 418px height)
- [ ] **Animation**: Slide-up from bottom with translate-y-full/translate-y-0
- [ ] **Header**: Buy/Sell dropdown + Market dropdown
- [ ] **Profile Section**: Market title + candidate name + Yes/No switcher
- [ ] **Amount Input**: Centered with plus/minus buttons on sides
- [ ] **Quick Add Buttons**: +$1, +$20, +$100, Max (above trade button)
- [ ] **To Win Section**: Centered layout with money bag icon
- [ ] **Trade Button**: Full width with py-3.5 padding
- [ ] **Terms Text**: "By trading, you agree to Terms of Use"
- [ ] **Input Focus States**: Raw value on focus, formatted on blur
- [ ] **Input Expansion**: w-full with flex-1 mx-4 for longer numbers

### **Desktop Features (isMobile = false)**
- [ ] **Container**: Absolute positioning (340px width, calc(100vh-200px) height)
- [ ] **Scrolling**: overflow-y-auto space-y-4
- [ ] **Profile Section**: Candidate name only
- [ ] **Buy/Sell Tabs**: Toggle buttons with active states
- [ ] **Market/Limit Dropdown**: Order type selection
- [ ] **Yes/No Selection**: Grid layout with price display
- [ ] **Amount Input**: Right-aligned with label
- [ ] **Quick Add Buttons**: Right-aligned in original position
- [ ] **To Win Section**: Right-aligned with detailed info
- [ ] **Limit Order Interface**: Complete limit order controls
- [ ] **Trade Button**: Standard py-2.5 padding

### **Shared Features (Both Mobile & Desktop)**
- [ ] **Trade Calculations**: calculatePotentialWin, calculateTotal, calculateLimitWin
- [ ] **Input Validation**: cleanTradeAmountInput, isTradeAmountWithinLimits
- [ ] **State Management**: All trading state props and handlers
- [ ] **Dark Mode**: Full dark mode support
- [ ] **Accessibility**: ARIA attributes, keyboard navigation
- [ ] **Error Handling**: Input validation and edge cases
- [ ] **Performance**: Font size calculations, memoization

## 🎯 **Critical Behaviors to Preserve**

### **Input Handling**
- [ ] **$ Sign Formatting**: Shows $0 placeholder, formats on blur
- [ ] **Focus States**: Raw value on focus, formatted on blur
- [ ] **Validation**: Limits and cleaning on input change
- [ ] **Expansion**: Mobile input expands for longer numbers
- [ ] **Plus/Minus**: Increment/decrement by 1
- [ ] **Quick Add**: +$1, +$20, +$100, Max buttons

### **State Management**
- [ ] **Trade Amount**: String state with validation
- [ ] **Trade Type**: "buy" or "sell" selection
- [ ] **Selected Candidate**: 0 (Yes) or 1 (No)
- [ ] **Order Type**: "market" or "limit"
- [ ] **Mobile Sidebar**: Open/close state
- [ ] **Input Focus**: Mobile input focus state
- [ ] **Dropdown States**: Buy dropdown, expiration dropdown

### **Calculations**
- [ ] **Potential Win**: calculatePotentialWin(amount, price)
- [ ] **Total**: calculateTotal(price, shares) for limit orders
- [ ] **Limit Win**: calculateLimitWin(shares, price) for limit orders
- [ ] **Font Sizing**: getTradeAmountFontSize, getWinAmountFontSize
- [ ] **Price Display**: currentPrice from selectedCandidate

### **Animations & Transitions**
- [ ] **Mobile Slide**: translate-y-full to translate-y-0
- [ ] **Dropdown Arrow**: Rotate 180 degrees on open
- [ ] **To Win Section**: animate-in slide-in-from-top-2
- [ ] **Button Hovers**: Transition colors on hover
- [ ] **Input Focus**: Smooth transitions

### **Layout & Styling**
- [ ] **Mobile Container**: w-[430px] min-h-[418px] fixed bottom
- [ ] **Desktop Container**: w-[340px] h-[calc(100vh-200px)] absolute
- [ ] **Mobile Header**: Buy/Sell + Market dropdowns
- [ ] **Desktop Header**: Buy/Sell tabs + Market/Limit dropdown
- [ ] **Mobile Profile**: Market title + candidate + Yes/No switcher
- [ ] **Desktop Profile**: Candidate name only
- [ ] **Mobile Input**: Centered with plus/minus buttons
- [ ] **Desktop Input**: Right-aligned with label
- [ ] **Mobile To Win**: Centered with money bag icon
- [ ] **Desktop To Win**: Right-aligned with detailed info

## 🚨 **Critical Dependencies**

### **Props Interface**
- [ ] **TradingSidebarProps**: All 20+ props must be preserved
- [ ] **Market Data**: market, selectedOutcome, selectedCandidate
- [ ] **Trade State**: tradeAmount, tradeType, orderType, limitPrice, shares
- [ ] **Expiration**: expirationEnabled, selectedExpiration
- [ ] **Mobile State**: isMobile, isMobileSidebarOpen, onMobileSidebarClose
- [ ] **Event Handlers**: All on* handlers must be preserved

### **Utility Functions**
- [ ] **calculatePotentialWin**: Core win calculation
- [ ] **calculateTotal**: Limit order total calculation
- [ ] **calculateLimitWin**: Limit order win calculation
- [ ] **getTradeAmountFontSize**: Dynamic font sizing
- [ ] **getWinAmountFontSize**: Dynamic font sizing
- [ ] **getExpirationOptions**: Expiration dropdown options
- [ ] **cleanTradeAmountInput**: Input cleaning
- [ ] **isTradeAmountWithinLimits**: Input validation

### **Type Definitions**
- [ ] **TradingSidebarProps**: Complete interface
- [ ] **Market**: Market data structure
- [ ] **Outcome**: Outcome data structure
- [ ] **TradeData**: Trade data structure
- [ ] **TradingState**: Trading state structure

## ✅ **Testing Checklist**

### **Mobile Testing**
- [ ] **Slide Animation**: Smooth slide-up from bottom
- [ ] **Input Focus**: Raw value on focus, formatted on blur
- [ ] **Plus/Minus**: Increment/decrement works
- [ ] **Quick Add**: All buttons work correctly
- [ ] **Yes/No Switcher**: Toggles between Yes/No
- [ ] **To Win Display**: Shows when amount entered
- [ ] **Trade Button**: Executes trade correctly
- [ ] **Terms Text**: Displays correctly
- [ ] **Close Function**: Closes sidebar properly

### **Desktop Testing**
- [ ] **Buy/Sell Tabs**: Toggle correctly
- [ ] **Market/Limit**: Dropdown works
- [ ] **Yes/No Selection**: Grid selection works
- [ ] **Amount Input**: Right-aligned formatting
- [ ] **Quick Add**: Right-aligned buttons work
- [ ] **To Win Display**: Right-aligned info
- [ ] **Limit Order**: All controls work
- [ ] **Trade Button**: Executes trade correctly
- [ ] **Scrolling**: Overflow handling works

### **Shared Testing**
- [ ] **Dark Mode**: All elements support dark mode
- [ ] **Accessibility**: Keyboard navigation works
- [ ] **Error Handling**: Validation works correctly
- [ ] **Performance**: No slowdowns or regressions
- [ ] **State Updates**: All state changes work
- [ ] **Calculations**: All math is correct
- [ ] **Input Validation**: Limits and cleaning work

## 🔄 **Rollback Plan**

### **Git Commands**
```bash
# Create backup branch
git checkout -b backup-trading-sidebar-$(date +%Y%m%d-%H%M%S)
git push origin backup-trading-sidebar-$(date +%Y%m%d-%H%M%S)

# Create refactor branch
git checkout -b refactor-trading-sidebar
git push origin refactor-trading-sidebar

# If rollback needed
git checkout main
git branch -D refactor-trading-sidebar
git checkout backup-trading-sidebar-$(date +%Y%m%d-%H%M%S)
```

### **Emergency Contacts**
- **Last Working Commit**: [To be filled after backup]
- **Backup Branch**: [To be created]
- **Rollback Time**: < 5 minutes

## 📊 **Success Metrics**

### **Quality Targets**
- [ ] **Line Count**: <200 lines per component
- [ ] **Code Duplication**: <5%
- [ ] **Test Coverage**: >80%
- [ ] **Performance**: No regressions

### **Feature Preservation**
- [ ] **100% Mobile Features**: All preserved
- [ ] **100% Desktop Features**: All preserved
- [ ] **100% Shared Features**: All preserved
- [ ] **0 Breaking Changes**: None introduced

---

**Created**: $(date)
**Last Updated**: $(date)
**Status**: Pre-refactoring documentation complete
