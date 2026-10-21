from typing import Any, Dict, List

def calculate_scenario_projections(
    initial_investment: float,
    development_costs: float,
    monthly_opex: float,
    product_price: float,
    initial_customers: int,
    variable_cost_per_customer: float,
    marketing_expenses: float,
    staffing_costs: float,
    monthly_growth_rate: float,
    scenario_name: str = "Base"
) -> Dict[str, Any]:
    """
    Computes a 12-month financial trajectory for a specific scenario using deterministic mathematical formulas.
    """
    total_upfront = initial_investment + development_costs
    fixed_monthly_costs = monthly_opex + staffing_costs + marketing_expenses
    unit_contribution = product_price - variable_cost_per_customer
    contribution_margin_pct = (unit_contribution / product_price * 100.0) if product_price > 0 else 0.0

    # Break-even customer count = fixed_costs / unit_contribution
    if unit_contribution > 0:
        break_even_customers = int(round(fixed_monthly_costs / unit_contribution))
    else:
        break_even_customers = -1  # Cannot break even with negative or zero unit contribution

    months: List[Dict[str, Any]] = []
    cumulative_cash = -total_upfront
    break_even_month = None

    current_customers = float(initial_customers)

    for m in range(1, 13):
        cust_count = int(round(current_customers))
        revenue = cust_count * product_price
        variable_costs = cust_count * variable_cost_per_customer
        gross_profit = revenue - variable_costs
        total_monthly_expenses = fixed_monthly_costs + variable_costs
        net_operating_result = revenue - total_monthly_expenses

        cumulative_cash += net_operating_result
        if break_even_month is None and cumulative_cash >= 0:
            break_even_month = m

        months.append({
            'month': m,
            'customers': cust_count,
            'revenue': round(revenue, 2),
            'variable_costs': round(variable_costs, 2),
            'fixed_expenses': round(fixed_monthly_costs, 2),
            'total_expenses': round(total_monthly_expenses, 2),
            'gross_profit': round(gross_profit, 2),
            'net_profit': round(net_operating_result, 2),
            'cumulative_cash_flow': round(cumulative_cash, 2)
        })

        # Compounding monthly growth
        current_customers = current_customers * (1.0 + (monthly_growth_rate / 100.0))

    year_total_revenue = sum(item['revenue'] for item in months)
    year_total_expenses = sum(item['total_expenses'] for item in months) + total_upfront
    year_net_profit = sum(item['net_profit'] for item in months) - total_upfront

    return {
        'scenario': scenario_name,
        'upfront_investment': round(total_upfront, 2),
        'fixed_monthly_costs': round(fixed_monthly_costs, 2),
        'unit_contribution': round(unit_contribution, 2),
        'contribution_margin_percentage': round(contribution_margin_pct, 1),
        'break_even_customers': break_even_customers,
        'estimated_break_even_month': break_even_month if break_even_month else "12+ months",
        'year_total_revenue': round(year_total_revenue, 2),
        'year_total_expenses': round(year_total_expenses, 2),
        'year_net_profit': round(year_net_profit, 2),
        'monthly_projections': months
    }

def run_financial_simulation(inputs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Runs multi-scenario financial model (Conservative, Base, Optimistic) using Python numerical calculations.
    """
    initial_investment = float(inputs.get('initial_investment', 0) or 0)
    development_costs = float(inputs.get('development_costs', 0) or 0)
    monthly_opex = float(inputs.get('monthly_opex', 0) or 0)
    product_price = float(inputs.get('product_price', 0) or 0)
    expected_customers = int(inputs.get('expected_customers', 0) or 0)
    variable_costs = float(inputs.get('variable_costs', 0) or 0)
    marketing_expenses = float(inputs.get('marketing_expenses', 0) or 0)
    staffing_costs = float(inputs.get('staffing_costs', 0) or 0)
    monthly_growth = float(inputs.get('monthly_growth', 0) or 0)

    # Base Scenario
    base_scenario = calculate_scenario_projections(
        initial_investment=initial_investment,
        development_costs=development_costs,
        monthly_opex=monthly_opex,
        product_price=product_price,
        initial_customers=expected_customers,
        variable_cost_per_customer=variable_costs,
        marketing_expenses=marketing_expenses,
        staffing_costs=staffing_costs,
        monthly_growth_rate=monthly_growth,
        scenario_name="Base"
    )

    # Conservative Scenario: 60% growth rate, 120% fixed expenses, 80% initial customers
    conservative_scenario = calculate_scenario_projections(
        initial_investment=initial_investment * 1.1,
        development_costs=development_costs * 1.1,
        monthly_opex=monthly_opex * 1.2,
        product_price=product_price,
        initial_customers=max(1, int(expected_customers * 0.8)),
        variable_cost_per_customer=variable_costs * 1.1,
        marketing_expenses=marketing_expenses * 1.2,
        staffing_costs=staffing_costs * 1.1,
        monthly_growth_rate=max(0.0, monthly_growth * 0.6),
        scenario_name="Conservative"
    )

    # Optimistic Scenario: 140% growth rate, 90% fixed expenses, 120% initial customers
    optimistic_scenario = calculate_scenario_projections(
        initial_investment=initial_investment,
        development_costs=development_costs,
        monthly_opex=monthly_opex * 0.9,
        product_price=product_price * 1.05,
        initial_customers=int(expected_customers * 1.2),
        variable_cost_per_customer=variable_costs * 0.9,
        marketing_expenses=marketing_expenses * 0.9,
        staffing_costs=staffing_costs,
        monthly_growth_rate=monthly_growth * 1.4,
        scenario_name="Optimistic"
    )

    formulas_used = {
        'Monthly Revenue': 'Customers * Product Price',
        'Gross Profit': 'Revenue - (Customers * Variable Cost)',
        'Contribution Margin %': '((Price - Variable Cost) / Price) * 100',
        'Net Operating Result': 'Gross Profit - (Monthly Opex + Staffing + Marketing)',
        'Break-Even Customers': 'Fixed Monthly Costs / (Price - Variable Cost per Customer)',
        'Break-Even Timing': 'Month when cumulative net earnings offset total upfront investment'
    }

    return {
        'inputs': inputs,
        'formulas': formulas_used,
        'base': base_scenario,
        'conservative': conservative_scenario,
        'optimistic': optimistic_scenario,
        'disclaimer': 'All figures are forward-looking financial estimates based on user assumptions and mathematical simulation.'
    }
